import React from 'react'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  onClick?: () => void
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  if (items.length === 0) return null

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
      <button
        onClick={items[0].onClick}
        className="flex items-center hover:text-gray-700 transition-colors"
      >
        <Home size={16} />
      </button>
      {items.slice(1).map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight size={16} className="text-gray-400" />
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-gray-700 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
