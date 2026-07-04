import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Generic GET-fetch hook: runs `fetcher()` on mount and whenever `deps`
 * change, tracking loading/error/data state. Guards against race
 * conditions by ignoring responses from a stale (superseded) request.
 *
 * @param {() => Promise<any>} fetcher
 * @param {any[]} deps
 */
export function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const requestId = useRef(0)

  const run = useCallback(() => {
    const id = ++requestId.current
    setState((prev) => ({ ...prev, loading: true, error: null }))

    Promise.resolve()
      .then(fetcher)
      .then((data) => {
        if (id === requestId.current) setState({ data, loading: false, error: null })
      })
      .catch((error) => {
        if (id === requestId.current) setState({ data: null, loading: false, error })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    run()
  }, [run])

  return { ...state, refetch: run }
}

export default useFetch
