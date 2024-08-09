import { useRef } from 'react'

export function useOnce<T>(fn: () => T) {
  const ref = useRef<T>()
  if (!ref.current) {
    ref.current = fn()
  }
  return ref.current
}

export function upperFirst<S extends string>(s: S): Capitalize<S> {
  return s[0]?.toUpperCase() + s.slice(1) as Capitalize<S>
}
