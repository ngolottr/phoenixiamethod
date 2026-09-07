import { useCallback, useEffect, useState } from 'react'

import { Atmosphere, Curtain } from './components/Atmosphere'
import { Cursor } from './components/Cursor'
import { Ripples } from './components/Ripples'
import { Intro } from './components/Intro'
import { Nav } from './components/Nav'

import { usePreferences, useViewportHeight } from './hooks/usePreferences'
import { SCENES, useSceneRouter } from './hooks/useSceneRouter'
import { AmbientContext, useAmbientProvider } from './hooks/useAmbient'

import { Home } from './scenes/Home'
import { About } from './scenes/About'
import { Gallery } from './scenes/Gallery'
import { Highlights } from './scenes/Highlights'
import { Work } from './scenes/Work'
import { Manifesto } from './scenes/Manifesto'
import { Contact } from './scenes/Contact'
import { Social } from './scenes/Social'

/** ¿El foco está dentro de un campo de texto? Entonces las flechas son suyas, no de la navegación. */
function typingInField() {
  const el = document.activeElement as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable
}

export default function App() {
  useViewportHeight()

  const { reduced, customCursor, toggleMotion, toggleCursor } = usePreferences()
  const { index, scene, direction, wiping, go, goTo, next, prev, home } = useSceneRouter(reduced)
  const ambient = useAmbientProvider()

  // El lightbox se apodera del teclado mientras está abierto
  const [navLocked, setNavLocked] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (navLocked || typingInField()) return

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        prev()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        home()
      } else if (e.key === 'Home') {
        e.preventDefault()
        home()
      } else if (e.key === 'End') {
        e.preventDefault()
        go(SCENES.length - 1)
      } else if (/^[1-8]$/.test(e.key)) {
        e.preventDefault()
        go(Number(e.key) - 1)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navLocked, next, prev, home, go])

  // Al cambiar de escena el color vuelve al de la marca: el tono de una
  // fotografía no debe quedarse pegado en la escena siguiente.
  const resetAmbient = ambient.reset
  useEffect(() => {
    resetAmbient()
  }, [scene.id, resetAmbient])

  // Ningún gesto de scroll debe mover el documento
  useEffect(() => {
    const block = (e: Event) => e.preventDefault()
    const target = document.getElementById('root')
    target?.addEventListener('touchmove', block as EventListener, { passive: false })
    return () => target?.removeEventListener('touchmove', block as EventListener)
  }, [])

  const renderScene = useCallback(() => {
    switch (scene.id) {
      case 'inicio':
        return (
          <Home
            onEnter={() => goTo('sobre-mi')}
            onWork={() => goTo('trabajo')}
            onContacto={() => goTo('contacto')}
          />
        )
      case 'sobre-mi':
        return <About />
      case 'galeria':
        return <Gallery onLockNav={setNavLocked} />
      case 'destacados':
        return <Highlights onLockNav={setNavLocked} />
      case 'trabajo':
        return <Work onLockNav={setNavLocked} />
      case 'manifiesto':
        return <Manifesto />
      case 'contacto':
        return <Contact />
      case 'redes':
        return <Social onHome={home} />
    }
  }, [scene.id, goTo, home])

  return (
    <AmbientContext.Provider value={ambient}>
      <a className="skip-link" href="#main">
        Ir al contenido
      </a>

      <Intro reduced={reduced} />
      <Atmosphere />
      <Cursor enabled={customCursor} />
      <Ripples enabled={!reduced} />
      <Curtain active={wiping} direction={direction} />

      <Nav
        index={index}
        scene={scene}
        onGo={go}
        onPrev={prev}
        onNext={next}
        reduced={reduced}
        onToggleMotion={toggleMotion}
        customCursor={customCursor}
        onToggleCursor={toggleCursor}
        hidden={navLocked}
      />

      <main className="stage" id="main">
        {/* La key fuerza el remontaje: cada escena entra con su propia animación */}
        <div key={scene.id} style={{ display: 'contents' }}>
          {renderScene()}
        </div>
      </main>
    </AmbientContext.Provider>
  )
}
