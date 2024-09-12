let isMob, loaderR, points = {};

const d = document,
  body = d.body,
  bc = body.classList,
  l = location,
  $ = (sel, p = d) => p.querySelector(sel),
  $each = (sel, call, p = d) => p.querySelectorAll(sel).forEach(call),
  getElement = sel => (typeof sel === 'string' ? $(sel) : sel),
  $o = (sel, func) => {
	  const el = getElement(sel)
	  if (el) {
		  const r = new IntersectionObserver(([e]) => {
			  func(e, e.target)
		  }, {
			  rootMargin: '0px',
			  threshold: 0.37,
		  })
		  r.observe(el)
		  return r
	  }

  },
  $e = (sel, type, call) => {
	  const el = getElement(sel)
	  el && el.addEventListener(type, call)
  },
  loader = new Promise(r => loaderR = r),
  $v = (sel, call, once = false) => {
	  loader.then(() => {
		  let obs = $o(sel, e => {
			  if (e.isIntersecting) {
				  call(sel)
				  if (once) {
					  obs.unobserve(sel)
				  }
			  }

		  })
	  })
  }

// Trigger scroll:
$o('.page-top', e => {
	bc[e.intersectionRatio === 0 ? 'add' : 'remove']('is-scroll')
})

$e(d, 'click', e => {
	const el = e.target

	if (el.tagName === 'A') {
		if (el.hash.startsWith('#')) {
			bc.remove('header-menu-active')
			return
		}
	}
	if (el.closest('[class^="fx-header-burger"]')) {
		bc.toggle('header-menu-active')
	}
})

// Contact:
function checkInput (el) {
	const method = el.value.length > 0 ? 'add' : 'remove'
	el.classList[method]('is-not-empty')
}

$e('.form', 'input', ({ target }) => {
	checkInput(target)
})
$each('.form input, .form textarea', checkInput)

// Sliders:
const toRem = v => parseFloat(getComputedStyle(d.documentElement).fontSize) * v
const sliderInstance = {}

const navigation = {
	nextEl: '.swiper-button-next',
	prevEl: '.swiper-button-prev',
}

function init () {
	if (isMob && innerWidth > 980 && (l.pathname === '/' || l.pathname === '/index.html')) l.reload()

	isMob = innerWidth < 980 && innerWidth < innerHeight

	createSlider('.case-study-slider', {
		slidesPerView: isMob ? 1 : 4,
		navigation,
	}).on('resize', e => {
		e.params.slidesPerView = isMob ? 1 : 4
		e.params.spaceBetween = isMob ? toRem(3) : toRem(4)
		e.update()
	})
	createSlider('.packages-slider', {
		slidesPerView: isMob ? 1 : 2,
		navigation,
	}).on('resize', e => {
		e.params.slidesPerView = isMob ? 1 : 2
		if (!isMob) {
			e.params.spaceBetween = toRem(4)
		}
		e.update()
	})

	if (isMob) {
		const options = {
			slideClass: 'slide',
			createElements: true,
			centeredSlides: true,
			slidesPerView: 1,
		}
		createSlider('.second-grid', options)
		createSlider('.about-group', options)
	}
	getPoints();
}

init()
$e(window, 'resize', init)

function createSlider (selector, options) {
	if (sliderInstance[selector]) return sliderInstance[selector]
	sliderInstance[selector] = new Swiper(selector, {
		paginator: true,
		grabCursor: true,
		freeMode: true,
		spaceBetween: toRem(3),

		pagination: {
			el: '.swiper-pagination',
			clickable: true,
		},
		...options,
	})

	return sliderInstance[selector]

}

const randAnim = (el, className = 'run', min = 200, max = 1000) => setTimeout(() => el.classList.add(className), min + Math.random() * max)
$each('.fx-animate-rand', el => randAnim(el, 'animate', 200, 1000))

// Animation

//Preloader

const addTextLoading = setTimeout(() => {
	$('.preloader').innerHTML = 'Ładowanie...'
}, 400)

$e(window, 'load', () => {
	bc.add('loaded')
	clearTimeout(addTextLoading)
	$e('.header', 'transitionend', loaderR)

})

const wordInSpan = el => {
	const originalText = el.innerHTML.replace(/ {2,}/g, ' ')
	let formattedText = ''
	let buffer = ''
	let insideTag = false

	for (let i = 0; i < originalText.length; i++) {
		const char = originalText[i]

		if (char === '<') {
			if (buffer) {
				formattedText += `<span>${buffer}</span>`
				buffer = ''
			}
			insideTag = true
			buffer += char
		} else if (char === '>') {
			insideTag = false
			buffer += char
			formattedText += buffer
			buffer = ''
		} else if (!insideTag && char === ' ') {
			formattedText += `<span>${buffer}</span> `
			buffer = ''
		} else {
			buffer += char
		}
	}

	if (buffer) {
		formattedText += `<span>${buffer}</span>`
	}

	el.innerHTML = formattedText
}
const animAfter = (el, call) => $e(el, 'transitionend', call)
const lastElemAnimate = el => {
	const ch = el.children,
	  len = ch.length
	return len ? ch[len - 1] : el
}

//Normalize:
$each('.anim-text-top, .anim-text-left', wordInSpan)

const vAnim = (sel, call) => $each(sel, el => $v(el, call, true))
const vAnimRun = (root, sel, call) => {
	const el = $(sel, root)
	if (!el) return 0
	el.classList.add('run')
	call && animAfter(lastElemAnimate(el), call)
}

// Welcome
vAnim('#welcome .container-1_2', el =>
  vAnimRun(el, 'h1', () =>
	vAnimRun(el, 'p', () =>
	  vAnimRun(el, '.btn'),
	),
  ),
)

const animArticle = (el, after) => (
  vAnimRun(el, '.sup-h2', () =>
	vAnimRun(el, 'h2', () =>
	  vAnimRun(el, 'p', () => {
		  vAnimRun(el, '.btn', after)
	  }),
	),
  )
)

vAnim('.section-oferta:not(#news)', animArticle)
vAnim('.anim-zoom-collection', root => {
	$each('.anim-zoom-item', el => randAnim(el, 'run', 250, 700), root)

})

vAnim('#news', el => animArticle(el, () =>
	vAnimRun(el, '.news-photo-1', () =>
	  vAnimRun(el, '.news-photo-2', () =>
		vAnimRun(el, '.news-photo-3'),
	  ),
	),
  ),
)
const vAnimRunItem = el => el.classList.add('run')

vAnim(`
	#o-nas .anim-text-top,
	#case-study .anim-text-top,
	#kontakt .form,
	#oferta .hero,
	#fifth .hero,
	.anim-bg-performance,
	#case-study .anim-fade-top,
	#logo
`, vAnimRunItem)


const getProgress = p => (scrollY - p.start) / p.range


function getPoints () {
	const h = innerHeight * .8
	$each('#seventh', el => {
		const rect = el.getBoundingClientRect()
		const start = rect.top + scrollY - h,
		  end = start + el.offsetHeight + h,
		  range = end - start

		points[el.className] = {
			start,
			end,
			range,
			el,
		}
	});

}

$e(window, 'resize', getPoints);
const $hands = $('#seventh .bg')?.children || [];


$e(window, 'scroll', () => {
	if(!$hands.length) return 0;
	for (const id in points) {
		const point = points[id]

		if (scrollY > point.start && scrollY < point.end) {
			const p = getProgress(point)
			$hands[0].style.rotate = 45*p + 'deg';
			$hands[1].style.rotate = -18*p + 'deg';
			$hands[2].style.rotate = -12*p + 'deg';
			$hands[3].style.rotate = -15*p + 'deg';
			$hands[4].style.rotate = -45*p + 'deg';
			$hands[5].style.rotate = -15*p + 'deg';
		}
	}
})


bc.add('js-anim')
