import { useEffect } from 'react'
import { useLocation, useNavigate, type Location } from 'react-router-dom'
import { isInTelegram, tgSetBackButton } from './telegram'

/** React Router keys the very first entry of a fresh session "default" — there's
 * nothing behind it in the SPA's own history, so navigate(-1) there would leave
 * the app (or no-op) instead of going to a page. Falls back to home in that case. */
function backNavigator(navigate: ReturnType<typeof useNavigate>, location: Location) {
  return () => {
    if (location.key === 'default') navigate('/', { replace: true })
    else navigate(-1)
  }
}

export function useBackButton(onBack?: () => void) {
  const navigate = useNavigate()
  const location = useLocation()
  const goBack = onBack ?? backNavigator(navigate, location)

  useEffect(() => {
    if (!isInTelegram()) return
    return tgSetBackButton(goBack)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, onBack, location.key])

  return { showFallback: !isInTelegram(), goBack }
}
