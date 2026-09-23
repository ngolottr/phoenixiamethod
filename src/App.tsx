import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

import { Atmosphere, Curtain } from './components/Atmosphere'
import { Cursor } from './components/Cursor'
import { Ripples } from './components/Ripples'
import { Intro } from './components/Intro'
import { Nav } from './components/Nav'

import { pintarBarraDelNavegador, usePreferences, useViewportHeight } from './hooks/usePreferences'
import { INICIO_DE_BLOQUE, SCENES, useSceneRouter } from './hooks/useSceneRouter'
import { AmbientContext, useAmbientProvider } from './hooks/useAmbient'
import { contarVista, iniciarAnalitica } from './lib/analitica'

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

  const { reduced, customCursor, theme, toggleTheme } = usePreferences()

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

  /* La piel del sitio la decide el bloque, no la escena.
     En el bloque de negocio manda Phoenix IA Method —brasa y fuego—; al pasar
     al de marketing el sitio vuelve al esmeralda de ElGolott. Todo eso son
     valores de token, así que basta con anunciar en <html> dónde estamos y el
     CSS reescribe la paleta entera. Va en un efecto de disposición para que un
     enlace directo a una escena personal no muestre primero un destello
     naranjo antes de corregirse. */
  useLayoutEffect(() => {
    document.documentElement.dataset.bloque = scene.bloque
    pintarBarraDelNavegador()
  }, [scene.bloque])

  // Estadísticas propias: el contador arranca una vez y cada escena cuenta
  // como vista. Ver src/lib/analitica.ts.
  useEffect(() => {
    iniciarAnalitica()
  }, [])
  useEffect(() => {
    contarVista(scene.id)
  }, [scene.id])

  // Al cambiar de escena el color vuelve al de la marca: el tono de una
  // fotografía no debe quedarse pegado en la escena siguiente.
  const resetAmbient = ambient.reset
  useEffect(() => {
    resetAmbient()
  }, [scene.id, resetAmbient])

  /* Ningún gesto debe mover el documento… pero sí los paneles que llevan su
     propio desplazamiento.

     Esto se decidía con una lista de nombres de clase, y la lista se quedó
     corta: el formulario de "Trabajemos juntos" vive en otro panel y no estaba
     nombrado, así que en el teléfono no se podía deslizar hasta el botón de
     enviar. Una lista escrita a mano siempre se va a quedar corta. Ahora se
     pregunta lo único que importa de verdad: ¿hay algún contenedor por encima
     del dedo que pueda desplazarse? La respuesta se calcula UNA vez, al empezar
     el gesto, no en cada uno de los sesenta avisos por segundo que manda el
     navegador mientras se arrastra. */
  useEffect(() => {
    const puedeDesplazarse = (el: HTMLElement) => {
      const cs = getComputedStyle(el)
      const desbordaY = el.scrollHeight > el.clientHeight + 1
      const desbordaX = el.scrollWidth > el.clientWidth + 1
      return (
        (desbordaY && /auto|scroll/.test(cs.overflowY)) ||
        (desbordaX && /auto|scroll/.test(cs.overflowX))
      )
    }

    let permitido = false

    const alTocar = (e: TouchEvent) => {
      permitido = false
      let n = e.target as HTMLElement | null
      while (n && n !== document.body) {
        if (puedeDesplazarse(n)) {
          permitido = true
          return
        }
        n = n.parentElement
      }
    }

    const alMover = (e: TouchEvent) => {
      if (!permitido) e.preventDefault()
    }

    const raiz = document.getElementById('root')
    raiz?.addEventListener('touchstart', alTocar as EventListener, { passive: true })
    raiz?.addEventListener('touchmove', alMover as EventListener, { passive: false })
    return () => {
      raiz?.removeEventListener('touchstart', alTocar as EventListener)
      raiz?.removeEventListener('touchmove', alMover as EventListener)
    }
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
            onEnter={() => goTo(INICIO_DE_BLOQUE.negocio)}
            onContacto={() => goTo('contacto')}
            arrastrable={false}
          />
        )
      case 'sobre-mi':
        return <About />
      case 'galeria':
        return <Gallery onLockNav={setNavLocked} />
      case 'destacados':
        return <Highlights onLockNav={setNavLocked} />
      case 'trabajo':
        return <Work onLockNav={setNavLocked} onContacto={() => goTo('contacto')} />
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
      <Atmosphere cursorActivo={customCursor} />
      <Cursor enabled={customCursor} />
      <Ripples enabled />
      <Curtain active={wiping} direction={direction} />

      <Nav
        index={index}
        scene={scene}
        onGo={go}
        onPrev={prev}
        onNext={next}
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
