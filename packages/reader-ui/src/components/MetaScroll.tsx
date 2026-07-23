import {
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

type MetaScrollFade = 'sidebar' | 'paper-elevated'

const FADE_CLASS: Record<MetaScrollFade, string> = {
  sidebar: 'from-sidebar via-sidebar/85 to-transparent',
  'paper-elevated': 'from-paper-elevated via-paper-elevated/85 to-transparent',
}

interface MetaScrollProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'nav'
  children: ReactNode
  fade?: MetaScrollFade
}

export function MetaScroll({
  as: Tag = 'div',
  children,
  className = '',
  fade = 'paper-elevated',
  ...props
}: MetaScrollProps) {
  const scrollRef = useRef<HTMLElement>(null)
  const [showEndFade, setShowEndFade] = useState(false)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) {
      return
    }

    const sync = () => {
      setShowEndFade(
        scrollContainer.scrollWidth > scrollContainer.clientWidth + 1 &&
          scrollContainer.scrollLeft + scrollContainer.clientWidth <
            scrollContainer.scrollWidth - 1,
      )
    }

    sync()
    scrollContainer.addEventListener('scroll', sync, { passive: true })
    const observer = 'ResizeObserver' in window ? new ResizeObserver(sync) : null
    observer?.observe(scrollContainer)
    if (scrollContainer.firstElementChild) {
      observer?.observe(scrollContainer.firstElementChild)
    }

    return () => {
      scrollContainer.removeEventListener('scroll', sync)
      observer?.disconnect()
    }
  }, [])

  const Component = Tag as ElementType

  return (
    <div className="relative min-w-0">
      <Component className={`meta-scroll overflow-x-auto ${className}`} ref={scrollRef} {...props}>
        {children}
      </Component>
      {showEndFade ? (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l ${FADE_CLASS[fade]}`}
        />
      ) : null}
    </div>
  )
}
