"""
Real PDF generation using ReportLab.
"""
from __future__ import annotations

from io import BytesIO
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
)

from app.models.database_models import Prediction
from app.services import history_service, analytics_service


class ReportNotReady(Exception):
    """Kept for backward compatibility."""


ACCENT = colors.HexColor("#3B82F6")
SUBTEXT = colors.HexColor("#64748B")


def _styles():
    s = getSampleStyleSheet()
    s.add(ParagraphStyle(
        name="TitleAccent", parent=s["Title"],
        textColor=ACCENT, fontSize=20, spaceAfter=4,
    ))
    s.add(ParagraphStyle(
        name="Sub", parent=s["Normal"],
        textColor=SUBTEXT, fontSize=10, spaceAfter=10,
    ))
    s.add(ParagraphStyle(
        name="SectionH", parent=s["Heading2"],
        textColor=ACCENT, fontSize=13, spaceBefore=14, spaceAfter=6,
    ))
    return s


def _header(story, styles, title: str, subtitle: str):
    story.append(Paragraph("Global Car Price Prediction AI", styles["TitleAccent"]))
    story.append(Paragraph(title, styles["Heading1"]))
    story.append(Paragraph(subtitle, styles["Sub"]))
    story.append(Spacer(1, 6 * mm))


def _footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(SUBTEXT)
    canvas.drawString(15 * mm, 10 * mm,
                      "Predictions are estimates. Not guaranteed selling prices.")
    canvas.drawRightString(A4[0] - 15 * mm, 10 * mm,
                           f"Page {doc.page}  |  {datetime.now(timezone.utc).strftime('%Y-%m-%d')}")
    canvas.restoreState()


def _kv_table(rows, col_widths=(55 * mm, 110 * mm)):
    t = Table(rows, colWidths=col_widths)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F1F5F9")),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#0F172A")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#CBD5E1")),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def generate_prediction_report(db: Session, prediction_id: int) -> bytes:
    record: Prediction | None = history_service.get_prediction(db, prediction_id)
    if not record:
        raise ValueError("Prediction not found")

    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=15 * mm, rightMargin=15 * mm,
                            topMargin=15 * mm, bottomMargin=20 * mm)
    styles = _styles()
    story = []

    _header(
        story, styles,
        "Prediction Report",
        f"Generated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
    )

    story.append(Paragraph("Vehicle Information", styles["SectionH"]))
    story.append(_kv_table([
        ["Type", record.vehicle_type.title()],
        ["Country", record.country],
        ["Brand", record.brand],
        ["Model", record.model],
        ["Year", str(record.manufacturing_year)],
        ["Mileage", f"{record.mileage:,.0f} km" if record.mileage else "—"],
        ["Fuel", record.fuel_type or "—"],
        ["Transmission", record.transmission or "—"],
    ]))

    story.append(Paragraph("Prediction", styles["SectionH"]))
    pred_rows = [
        ["Estimated Price", f"{record.predicted_price:,.0f} {record.original_currency}"],
        ["Model Version", record.model_version],
    ]
    if record.price_min is not None and record.price_max is not None:
        pred_rows.insert(1, ["Range",
                             f"{record.price_min:,.0f} – {record.price_max:,.0f} {record.original_currency}"])
    story.append(_kv_table(pred_rows))

    if record.notes:
        story.append(Paragraph("Important Notes", styles["SectionH"]))
        story.append(Paragraph(record.notes, styles["Normal"]))

    doc.build(story, onFirstPage=_footer, onLaterPages=_footer)
    return buf.getvalue()


def generate_analytics_report(db: Session) -> bytes:
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=15 * mm, rightMargin=15 * mm,
                            topMargin=15 * mm, bottomMargin=20 * mm)
    styles = _styles()
    story = []
    _header(story, styles, "Market Analysis Report",
            f"Generated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")

    ov = analytics_service.overview(db)
    story.append(Paragraph("Overview", styles["SectionH"]))
    story.append(_kv_table([
        ["Total Predictions", str(ov.total_predictions)],
        ["New", str(ov.new_count)],
        ["Used", str(ov.used_count)],
        ["Countries", str(ov.countries_supported)],
        ["Brands", str(ov.brands_supported)],
    ]))

    countries = analytics_service.countries(db)
    if countries:
        story.append(Paragraph("Country-wise Predictions", styles["SectionH"]))
        rows = [["Country", "Count", "Avg Price"]]
        for c in countries[:15]:
            rows.append([c.country, str(c.count),
                         f"{c.avg_price:,.0f}" if c.avg_price else "—"])
        t = Table(rows, colWidths=(60 * mm, 40 * mm, 60 * mm))
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), ACCENT),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#CBD5E1")),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(t)

    doc.build(story, onFirstPage=_footer, onLaterPages=_footer)
    return buf.getvalue()