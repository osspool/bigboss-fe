// components/Thumbnail.jsx
'use client'

import Image from 'next/image'
import { cn } from "@/lib/utils"

const aspectRatios = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
}

const sizes = {
  small: 'w-16 h-16',
  medium: 'w-32 h-32',
  large: 'w-48 h-48',
  full: 'w-full h-full'
}

const Thumbnail = ({
  src,
  alt,
  aspect = 'square',
  size = 'medium',
  className,
  fallback = '/placeholder.svg',
  onClick,
}) => {
  // If a custom size is provided through className, use that instead of predefined sizes
  const sizeClass = className?.includes('w-') ? '' : sizes[size]

  return (
    <div 
      className={cn(
        "relative rounded-md overflow-hidden",
        aspectRatios[aspect],
        sizeClass,
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <Image
        src={src || fallback}
        alt={alt || "Thumbnail"}
        fill
        className="object-cover"
        sizes={getSizes(size)}
      />
    </div>
  )
}

// Helper function to return appropriate sizes based on thumbnail size
const getSizes = (size) => {
  switch(size) {
    case 'small':
      return '64px' // 16rem
    case 'medium':
      return '128px' // 32rem
    case 'large':
      return '192px' // 48rem
    case 'full':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    default:
      return '128px'
  }
}

export default Thumbnail