import { useEffect, useState } from 'react'
import { Car } from 'lucide-react'

export default function CarImage({ brand, model }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!brand || !model) return
    setLoading(true)
    setError(false)

    const searchTerm = encodeURIComponent(`${brand} ${model}`)
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchTerm}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&format=json&origin=*`

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const pages = data.query?.pages
        if (pages) {
          const firstPage = Object.values(pages)[0]
          const imgUrl = firstPage?.imageinfo?.[0]?.url
          if (imgUrl) setImageUrl(imgUrl)
          else setError(true)
        } else {
          setError(true)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [brand, model])

  if (loading) {
    return (
      <div className="h-48 bg-bgSecondary rounded-xl flex items-center justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error || !imageUrl) {
    return (
      <div className="h-48 bg-bgSecondary rounded-xl flex flex-col items-center justify-center text-textSub">
        <Car size={40} className="mb-2 opacity-50" />
        <p className="text-xs">Image not found</p>
      </div>
    )
  }

  return (
    <div className="h-48 bg-bgSecondary rounded-xl overflow-hidden">
      <img
        src={imageUrl}
        alt={`${brand} ${model}`}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  )
}