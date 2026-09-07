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

  const {
    reduced,
    customCursor,
    drag,
    theme,
    toggleMotion,
    toggleCursor,
    toggleDrag,
    toggleTheme,
  } = usePreferences()
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

  /* Ningún gesto debe mover el documento… pero sí los paneles que llevan su
     propio desplazamiento. Cancelar el touchmove en la raíz mataba también el
     scroll de adentro: en el teléfono la galería y el texto de "Sobre mí"
     quedaban cortados y no había forma de llegar al resto. */
  useEffect(() => {
    const DESPLAZABLES = '.pane-scroll, .gal-strip, .work-list, [data-desplazable]'
    const block = (e: TouchEvent) => {
      const el = e.target as HTMLElement | null
      if (el?.closest?.(DESPLAZABLES)) return
      e.preventDefault()
    }
    const target = document.getElementById('root')
    target?.addEventListener('touchmove', block as EventListener, { passive: false })
    return () => target?.removeEventListener('touchmove', block as EventListener)
  }, [])

  /* Al abrir el teclado, iOS empuja el documento entero hacia arriba para
     enseñar el campo con foco — aunque el documento tenga el desplazamiento
     desactivado— y después no lo devuelve: la cabecera se quedaba fuera de la
     pantalla. En cuanto el campo suelta el foco, todo vuelve a su sitio. */
  useEffect(() => {
    const devolver = () => {
      requestAnimationFrame(() => {
        if (typingInField()) return
        if (window.scrollY !== 0 || window.scrollX !== 0) window.scrollTo(0, 0)
      })
    }
    const vv = window.visualViewport
    window.addEventListener('focusout', devolver)
    vv?.addEventListener('resize', devolver)
    return () => {
      window.removeEventListener('focusout', devolver)
      vv?.removeEventListener('resize', devolver)
    }
  }, [])

  const renderScene = useCallback(() => {
    switch (scene.id) {
      case 'inicio':
        return (
          <Home
            onEnter={() => goTo('sobre-mi')}
            onWork={() => goTo('trabajo')}
            onContacto={() => goTo('contacto')}
            arrastrable={drag}
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
  }, [scene.id, goTo, home, drag])

  return (
    <AmbientContext.Provider value={ambient}>
      <a className="skip-link" href="#main">
        Ir al contenido
      </a>

      <Intro reduced={reduced} />
      <Atmosphere cursorActivo={customCursor} />
      <Cursor enabled={customCursor} />
      <Ripples enabled={drag} />
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
        drag={drag}
        onToggleDrag={toggleDrag}
        theme={theme}
        onToggleTheme={toggleTheme}
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
