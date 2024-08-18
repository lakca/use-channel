/* eslint-disable @typescript-eslint/no-explicit-any */
import { DependencyList, EffectCallback, useEffect, useMemo, useRef } from 'react'

export function useOnce<T>(fn: () => T) {
  const ref = useRef<T>()
  if (!ref.current) {
    ref.current = fn()
  }
  return ref.current
}

export function useMounted() {
  const mounted = useRef(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    mounted.current = true
  }, [])
  return mounted.current
}

export function useSyncEffect(effect: EffectCallback, deps: DependencyList) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const disposal = useMemo(effect, deps)
  useEffect(() => disposal, [disposal])
}

export function upperFirst<S extends string>(s: S): Capitalize<S> {
  return s[0]?.toUpperCase() + s.slice(1) as Capitalize<S>
}

export function lowerFirst<S extends string>(s: S): Uncapitalize<S> {
  return s[0]?.toLowerCase() + s.slice(1) as Uncapitalize<S>
}
