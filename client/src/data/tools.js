import {
  FilePlus,
  Scissors,
  FileImage,
  Image as ImageIcon,
  RotateCw,
  Trash2,
  ArrowUpDown,
  Droplets,
  PenTool,
  Minimize2,
  FileText
} from 'lucide-react'

export const tools = [
  {
    name: 'Merge PDF',
    slug: 'merge-pdf',
    description: 'Combine multiple PDF files into one document.',
    icon: FilePlus,
    category: 'merge'
  },
  {
    name: 'Split PDF',
    slug: 'split-pdf',
    description: 'Extract pages or divide a PDF into separate files.',
    icon: Scissors,
    category: 'split'
  },
  {
    name: 'Compress PDF',
    slug: 'compress-pdf',
    description: 'Reduce PDF file size while maintaining quality.',
    icon: Minimize2,
    category: 'compress'
  },
  {
    name: 'PDF → JPG',
    slug: 'pdf-to-jpg',
    description: 'Convert PDF pages into JPG images.',
    icon: FileImage,
    category: 'convert'
  },
  {
    name: 'JPG → PDF',
    slug: 'jpg-to-pdf',
    description: 'Create a PDF from JPG images.',
    icon: ImageIcon,
    category: 'convert'
  },
  {
    name: 'Rotate PDF',
    slug: 'rotate-pdf',
    description: 'Rotate PDF pages to the correct orientation.',
    icon: RotateCw,
    category: 'edit'
  },
  {
    name: 'Delete Pages',
    slug: 'delete-pages',
    description: 'Remove unwanted pages from your PDF.',
    icon: Trash2,
    category: 'edit'
  },
  {
    name: 'Reorder Pages',
    slug: 'reorder-pages',
    description: 'Rearrange PDF pages in the order you need.',
    icon: ArrowUpDown,
    category: 'edit'
  },
  {
    name: 'Watermark PDF',
    slug: 'watermark-pdf',
    description: 'Add a watermark to your PDF.',
    icon: FileText,
    category: 'edit'
  },
  {
    name: 'Add Text / Signature',
    slug: 'add-text-signature',
    description: 'Add text or a signature to a PDF.',
    icon: PenTool,
    category: 'edit'
  }
]

export const getToolBySlug = (slug) => {
  return tools.find(tool => tool.slug === slug)
}
