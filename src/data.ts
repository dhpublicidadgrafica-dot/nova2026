import { ServiceDetail, PortfolioItem, BlogArticle, Testimonial } from './types';

export const SERVICES_DATA: ServiceDetail[] = [
  {
    id: 'branding',
    title: 'Branding de Marca',
    tagline: 'CONSTRUIMOS MARCAS MEMORABLES',
    description: 'Diseñamos identidades visuales sólidas que transmiten confianza y diferencian a nuestros clientes de la competencia.',
    color: '#60AB26', // Green
    iconName: 'Sparkles',
    benefits: [
      { title: 'Diseño de Logotipo & Brand Book', description: 'Logotipo con proporciones vectoriales de alta precisión y manual de marca integral.' },
      { title: 'Manual de Identidad & Paleta de Colores', description: 'Definición cromática técnica (RGB, CMYK, Hex) y tipografías corporativas.' },
      { title: 'Papelería Comercial & Merch', description: 'Tarjetas, carpetas, membretes y papelería corporativa de alta distinción.' },
      { title: 'Plantillas para Redes Sociales', description: 'Kits gráficos editables para mantener una comunicación consistente en todos los canales.' }
    ],
    process: [
      { phase: '01', title: 'Descubrimos', description: 'Analizamos tu negocio, mercado, competidores y objetivos de marca.' },
      { phase: '02', title: 'Diseñamos', description: 'Creamos la estrategia conceptual, paletas cromáticas y propuestas de logotipo.' },
      { phase: '03', title: 'Desarrollamos', description: 'Elaboramos el Manual de Identidad, tipografías y piezas corporativas.' },
      { phase: '04', title: 'Implementamos', description: 'Entregamos el Brand Book, archivos vectoriales editables y plantillas para redes.' }
    ],
    faq: [
      { question: '¿Qué incluye el Manual de Identidad o Brand Book de DIGITAL HOME?', answer: 'Incluye el diseño de logotipo, variaciones permitidas, paleta de colores corporativos, tipografías principales y secundarias, usos correctos e incorrectos, papelería comercial y plantillas para redes sociales.' },
      { question: '¿En qué formatos entregan los archivos finales?', answer: 'Entregamos el Brand Book en PDF de alta resolución, así como los archivos vectoriales nativos en AI, EPS, SVG y PNGs transparentes de alta calidad.' }
    ]
  },
  {
    id: 'web',
    title: 'Páginas Web Corporativas',
    tagline: 'DISEÑAMOS SITIOS WEB MODERNOS',
    description: 'Cada página está optimizada para transmitir confianza, captar clientes y posicionar la marca.',
    color: '#F7AA03', // Yellow
    iconName: 'Globe',
    benefits: [
      { title: 'Dominio + Hosting (1 año)', description: 'Alojamiento en la nube de alta velocidad e infraestructura segura de 1 año.' },
      { title: 'Diseño 100% Personalizado', description: 'Desarrollo web exclusivo sin plantillas rígidas, adaptado a los objetivos de tu empresa.' },
      { title: 'WhatsApp & Formularios Inteligentes', description: 'Integración directa con WhatsApp, redes sociales y captura estratégica de clientes.' },
      { title: 'Certificado SSL & Correos Corporativos', description: 'Navegación encriptada segura (HTTPS), geolocalización en Google Maps y correos profesionales.' }
    ],
    process: [
      { phase: '01', title: 'Descubrimos', description: 'Mapeamos los requerimientos de tu negocio, arquitectura de información y público objetivo.' },
      { phase: '02', title: 'Diseñamos', description: 'Estructuramos prototipos UI/UX visuales enfocados en conversión y posicionamiento.' },
      { phase: '03', title: 'Desarrollamos', description: 'Programamos la web en React/Next.js con tiempos de carga de ultra alta velocidad.' },
      { phase: '04', title: 'Implementamos & Optimizamos', description: 'Configuramos SSL, correos corporativos, SEO técnico y puesta en marcha global.' }
    ],
    faq: [
      { question: '¿La página web se adapta a teléfonos móviles?', answer: 'Sí, el 100% de nuestros desarrollos son totalmente adaptables (Responsive Design) para smartphones, tablets y ordenadores de escritorio.' },
      { question: '¿Incluye dominio y hosting por un año?', answer: 'Sí, todas nuestras páginas web incluyen dominio corporativo (.com/.cl/.co), certificado de seguridad SSL y hosting de alta velocidad durante 1 año completo.' }
    ]
  },
  {
    id: 'ecommerce',
    title: 'Tiendas Online',
    tagline: 'PLATAFORMAS DE COMERCIO ELECTRÓNICO',
    description: 'Ideal para vender tus productos 24/7 de forma online con todos los medios de pago disponibles de forma segura.',
    color: '#DE4C00', // Orange
    iconName: 'ShoppingBag',
    benefits: [
      { title: 'Catálogo & Carrito de Compras', description: 'Gestión fluida de productos, variantes, precios e inventario dinámico.' },
      { title: 'Pasarela de Pagos Segura', description: 'Acepta tarjetas de crédito, débito, transferencias y pagos locales.' },
      { title: 'Integración con WhatsApp & Redes', description: 'Conexión con ventas por WhatsApp, Instagram Shopping y Facebook Catalog.' },
      { title: 'Dominio, Hosting SSL & Mobile', description: 'Experiencia checkout de compra ultrarrápida sin fricciones en dispositivos móviles.' }
    ],
    process: [
      { phase: '01', title: 'Descubrimos', description: 'Analizamos la jerarquía de tus productos, métodos de pago y logística de envíos.' },
      { phase: '02', title: 'Diseñamos', description: 'Creamos un flujo de compra intuitivo optimizado para elevar la tasa de conversión.' },
      { phase: '03', title: 'Desarrollamos', description: 'Configuramos el catálogo, carrito de compras y sincronización de pasarelas.' },
      { phase: '04', title: 'Implementamos', description: 'Pruebas de cobro reales, certificado SSL y lanzamiento de la tienda 24/7.' }
    ],
    faq: [
      { question: '¿Qué pasarelas de pago se pueden integrar en la tienda online?', answer: 'Integramos Stripe, Mercado Pago, PayPal, Addi, Webpay, PayU y transferencias bancarias directas con confirmaciones automáticas.' },
      { question: '¿Podré administrar los productos y precios yo mismo?', answer: 'Sí, te entregamos un panel de administración muy fácil de usar para subir productos, modificar precios, gestionar inventario y procesar pedidos.' }
    ]
  },
  {
    id: 'ai',
    title: 'Agentes IA',
    tagline: 'AGENTES DE IA 24/7',
    description: 'Desarrollamos asistentes inteligentes entrenados para vender, atender clientes y automatizar procesos.',
    color: '#044FCD', // Blue
    iconName: 'Cpu',
    benefits: [
      { title: 'Servicio al Cliente Automatizado 24/7', description: 'Atención instantánea que resuelve preguntas y vende las 24 horas del día.' },
      { title: 'Calificación de Prospectos & Citas', description: 'Filtrado inteligente de clientes potenciales y agendamiento de citas en Calendar.' },
      { title: 'Integración Multi-Canal', description: 'Conexión fluida con WhatsApp, Correo Electrónico, CRM, Página Web y Redes Sociales.' },
      { title: 'Aptitud Cognitiva & Aprendizaje', description: 'Entrenado con tus datos corporativos; aprende y mejora el rendimiento semana a semana.' }
    ],
    process: [
      { phase: '01', title: 'Descubrimos', description: 'Ingestamos tus preguntas frecuentes, catálogo de servicios y flujo de ventas.' },
      { phase: '02', title: 'Diseñamos', description: 'Diseñamos la personalidad del agente, tono de marca y árbol de decisiones.' },
      { phase: '03', title: 'Desarrollamos', description: 'Entrenamos el modelo cognitivo con LLMs avanzados y programamos APIs.' },
      { phase: '04', title: 'Implementamos', description: 'Conectamos el agente con WhatsApp Cloud API, tu CRM y medimos conversiones.' }
    ],
    faq: [
      { question: '¿Cómo se conecta el Agente de IA con nuestro WhatsApp?', answer: 'Utilizamos la API Oficial de WhatsApp Business para conectar el agente cognitivo directamente con el número de tu empresa de forma segura y certificada.' },
      { question: '¿El agente puede agendar citas en nuestro calendario?', answer: 'Sí, el agente de IA califica al cliente, verifica la disponibilidad en tiempo real en Google Calendar o Outlook y programa la cita notificando a tu equipo.' }
    ]
  },
  {
    id: 'software',
    title: 'Software a Medida',
    tagline: 'SOLUCIONES DIGITALES EMPRESARIALES',
    description: 'Diseñamos plataformas empresariales completamente personalizadas según las necesidades de la empresa.',
    color: '#6A1EB3', // Purple
    iconName: 'Code2',
    benefits: [
      { title: 'CRM / ERP & Inventarios', description: 'Gestión unificada de clientes, cotizaciones, stock y flujo operativo.' },
      { title: 'Facturación & Sistemas Administrativos', description: 'Automatización de comprobantes, cuentas por cobrar y reportes financieros.' },
      { title: 'Dashboards & Analítica en Tiempo Real', description: 'Paneles con gráficos interactivos para tomar decisiones basadas en datos.' },
      { title: 'Aplicaciones Móviles & Marketplaces', description: 'Plataformas escalables diseñadas para alta demanda y procesos a la medida.' }
    ],
    process: [
      { phase: '01', title: 'Descubrimos', description: 'Reunión de levantamiento de procesos, arquitectura de base de datos y flujos.' },
      { phase: '02', title: 'Diseñamos', description: 'Maquetación de pantallas, arquitectura de sistemas y seguridad de datos.' },
      { phase: '03', title: 'Desarrollamos', description: 'Programación modular full-stack con código robusto y pruebas de carga.' },
      { phase: '04', title: 'Implementamos', description: 'Despliegue en servidores en la nube, capacitación del personal y soporte.' }
    ],
    faq: [
      { question: '¿Qué tipo de plataformas de software desarrollan?', answer: 'Desarrollamos sistemas CRM, ERPs de gestión, portales de clientes, software de facturación e inventario, dashboards ejecutivos y aplicaciones móviles corporativas.' },
      { question: '¿El código del software a medida es de nuestra propiedad?', answer: 'Sí, todo el código fuente y propiedad intelectual son 100% de la empresa contratante una vez finalizado el proyecto.' }
    ]
  },
  {
    id: 'merch',
    title: 'Merchandising',
    tagline: 'HAZ QUE TU MARCA SE VEA Y GENERE IMPACTO',
    description: 'Producimos material corporativo personalizado para que tu marca transmita confianza y profesionalismo.',
    color: '#FF1D1D', // Red
    iconName: 'Award',
    benefits: [
      { title: 'Papelería Corporativa & P.O.P.', description: 'Tarjetas de lujo, carpetas, flyers, stands y material publicitario gran formato.' },
      { title: 'Packaging Personalizado & Adhesivos', description: 'Diseño estructural de cajas, bolsas ecológicas, etiquetas y empaques de regalo.' },
      { title: 'Uniformes Empresariales', description: 'Camisas, chaquetas, gorras y prendas técnicas con bordado o estampado de alta definición.' },
      { title: 'Regalos Corporativos Premium', description: 'Artículos promocionales de alto impacto para fidelizar clientes y colaboradores.' }
    ],
    process: [
      { phase: '01', title: 'Descubrimos', description: 'Definimos los objetivos promocionales, cantidades y presupuesto para el merchandising.' },
      { phase: '02', title: 'Diseñamos', description: 'Creamos bocetos 3D, muestras digitales y planos de troquel con medidas exactas.' },
      { phase: '03', title: 'Desarrollamos', description: 'Procesamiento de muestras de prueba, selección de acabados y producción industrial.' },
      { phase: '04', title: 'Implementamos', description: 'Control de calidad estricto y entrega del material corporativo final listo para usar.' }
    ],
    faq: [
      { question: '¿Producen uniformes y empaques con el logotipo impreso?', answer: 'Sí, nos encargamos de todo el proceso de diseño, selección de insumos de alta calidad y producción terminada de uniformes, bolsas, cajas y regalos corporativos.' },
      { question: '¿Tienen cobertura de entrega?', answer: 'Contamos con envíos y logística de distribución nacional en Colombia, Chile y envíos corporativos internacionales.' }
    ]
  }
];

export const PORTFOLIO_DATA: PortfolioItem[] = [
  {
    id: 'p1',
    title: 'Ecosistema Digital Corporativo',
    client: 'DIGITAL HOME',
    category: 'Páginas Web / Branding',
    serviceId: 'web',
    description: 'Desarrollo de ecosistema digital de alta velocidad con identidad de marca memorable y componentes animados en 3D para una experiencia inmersiva.',
    result: 'Generación acelerada de clientes, velocidad de carga instantánea y posicionamiento de marca de vanguardia.',
    imageUrl: 'https://lh3.googleusercontent.com/d/13_pJH4OVTJC1K-WVamiY9c5M81fPcT6H',
    tags: ['React', 'Next.js', 'Branding', 'SEO']
  },
  {
    id: 'p2',
    title: 'Agente Cognitivo IA 24/7',
    client: 'DIGITAL HOME AI Division',
    category: 'Agentes IA',
    serviceId: 'ai',
    description: 'Integración de asistente virtual inteligente con modelo de lenguaje entrenado para calificación de prospectos, atención al cliente y agendamiento automático en WhatsApp.',
    result: 'Atención ininterrumpida las 24 horas y reducción del 80% en tiempo de respuesta comercial.',
    imageUrl: 'https://lh3.googleusercontent.com/d/1Dcrwwk7ihJtrPiYWk_YNgxin8J6uYwaI',
    tags: ['Gemini IA', 'WhatsApp API', 'CRM', 'Automatización']
  },
  {
    id: 'p3',
    title: 'Plataforma de Comercio Electrónico',
    client: 'E-Commerce Enterprise',
    category: 'Tiendas Online',
    serviceId: 'ecommerce',
    description: 'Construcción de plataforma e-commerce con catálogo interactivo, carrito de compras sin fricción y pasarela de pagos segura.',
    result: 'Incremento del 120% en ventas en línea y conversión optimizada en dispositivos móviles.',
    imageUrl: 'https://lh3.googleusercontent.com/d/10DT70pkZ5c4cftWpLa05rmQkp2-kRHrc',
    tags: ['E-Commerce', 'Pasarelas de Pago', 'Mobile First', 'SSL']
  },
  {
    id: 'p4',
    title: 'Sistema ERP & Dashboard a Medida',
    client: 'Empresa Industrial',
    category: 'Software a Medida',
    serviceId: 'software',
    description: 'Desarrollo de plataforma administrativa personalizada con módulos de inventarios, facturación y dashboards ejecutivos en tiempo real.',
    result: 'Automatización total de procesos internos y control en tiempo real de la operación.',
    imageUrl: 'https://lh3.googleusercontent.com/d/1KTjnwlBvNcbTwcSIHpJOB23_6nzH0b25',
    tags: ['CRM / ERP', 'Dashboards', 'React', 'Node.js']
  }
];

export const METHOD_DATA = [
  {
    step: '01',
    name: 'DESCUBRIMOS',
    tagline: 'Análisis de Negocio.',
    description: 'Analizamos tu negocio, mercado, competidores y objetivos estratégicos para trazar el camino más rentable.'
  },
  {
    step: '02',
    name: 'DISEÑAMOS',
    tagline: 'Estrategia Digital.',
    description: 'Creamos una estrategia digital y experiencia visual alineada con la identidad de tu marca y enfoque a ventas.'
  },
  {
    step: '03',
    name: 'DESARROLLAMOS',
    tagline: 'Ingeniería Robusta.',
    description: 'Construimos la solución utilizando tecnología moderna, limpia, segura y totalmente escalable.'
  },
  {
    step: '04',
    name: 'IMPLEMENTAMOS',
    tagline: 'Puesta en Marcha.',
    description: 'Ponemos en marcha el proyecto y realizamos todas las integraciones necesarias con tu ecosistema operativo.'
  },
  {
    step: '05',
    name: 'OPTIMIZAMOS',
    tagline: 'Mejora Continua.',
    description: 'Medimos los resultados con datos reales y mejoramos continuamente para maximizar el rendimiento y las ventas.'
  }
];

export const TECHNOLOGIES_DATA = [
  { name: 'React', icon: 'React', category: 'Frontend', color: '#0D6EFD' },
  { name: 'Next.js', icon: 'Next', category: 'Frontend', color: '#FFFFFF' },
  { name: 'TypeScript', icon: 'TS', category: 'Lenguajes', color: '#0D6EFD' },
  { name: 'Node.js', icon: 'Node', category: 'Backend', color: '#22C55E' },
  { name: 'Python / LLMs', icon: 'Python', category: 'IA / Backend', color: '#FFC107' },
  { name: 'Inteligencia Artificial', icon: 'Google', category: 'IA', color: '#0D6EFD' },
  { name: 'Shopify / E-Commerce', icon: 'Shopify', category: 'Comercio', color: '#22C55E' },
  { name: 'WhatsApp Cloud API', icon: 'Fire', category: 'Integraciones', color: '#FF7A00' },
  { name: 'Supabase / PostgreSQL', icon: 'Supa', category: 'Base de Datos', color: '#22C55E' },
  { name: 'Pasarelas de Pago', icon: 'Stripe', category: 'Pagos', color: '#7B2FF7' }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 't1',
    author: 'Andrés Pérez',
    role: 'CEO',
    company: 'ELEVEN INGENIERÍA',
    rating: 5,
    content: 'Desarrollaron nuestro sitio web y la identidad de marca con un nivel de profesionalismo excepcional. El resultado ha sido un incremento inmediato en la captación de nuevos clientes.',
    avatarUrl: 'https://lh3.googleusercontent.com/d/16LAP_YQpLymC-_8oFtpm2Q3IXUihCX6X'
  },
  {
    id: 't2',
    author: 'Jorge Arias',
    role: 'CEO',
    company: 'LOGICOMEX',
    rating: 5,
    content: 'El rediseño de nuestra identidad de marca e imagen corporativa fue extraordinario. DIGITAL HOME logró capturar la verdadera esencia de LOGICOMEX, proyectando una marca sólida, moderna y de alto impacto en el mercado.',
    avatarUrl: 'https://lh3.googleusercontent.com/d/1qhsPmcii__lJm_NAIyjs2lCm6RmN4pWc'
  },
  {
    id: 't3',
    author: 'Jorge Betancur',
    role: 'GERENTE',
    company: 'RC TRANSPORTE',
    rating: 5,
    content: 'El merchandising corporativo y los productos de marca desarrollados por DIGITAL HOME superaron todas nuestras expectativas. La calidad del material, los acabados y la atención al detalle permitieron posicionar la imagen de RC Transporte con elegancia y profesionalismo.',
    avatarUrl: 'https://lh3.googleusercontent.com/d/1GZQpKIEVYLSlVzvuD2Igge4L8pyqedVb'
  }
];

export const BLOG_DATA: BlogArticle[] = [
  {
    id: 'b1',
    title: 'Agentes de Inteligencia Artificial: Cómo automatizar ventas y atención 24/7 en tu empresa',
    category: 'Inteligencia Artificial',
    date: '22 Jul 2026',
    readTime: '4 min lectura',
    summary: 'Descubre cómo los asistentes virtuales de IA entrenados con tus datos pueden calificar prospectos y agendar citas de forma automática en WhatsApp y web.',
    content: 'Los asistentes virtuales inteligentes están revolucionando la forma en que las empresas atienden a sus clientes. A diferencia de los bots tradicionales rígidos, los Agentes de Inteligencia Artificial de DIGITAL HOME entienden el lenguaje natural, responden dudas con el tono exacto de tu marca, califican prospectos y registran datos directamente en tu CRM. Esto garantiza una atención comercial inmediata 24/7 sin perder oportunidades de venta.',
    imageUrl: 'https://lh3.googleusercontent.com/d/1Dcrwwk7ihJtrPiYWk_YNgxin8J6uYwaI'
  },
  {
    id: 'b2',
    title: 'Por qué tu negocio necesita un ecosistema digital y no solo una página web estática',
    category: 'Desarrollo Web',
    date: '15 Jul 2026',
    readTime: '5 min lectura',
    summary: 'En DIGITAL HOME no creamos páginas aisladas; integramos estrategia, diseño, tecnología y automatización para generar resultados medibles.',
    content: 'Una página web bonita no es suficiente si no está conectada a un ecosistema estratégico. Para que la inversión en tecnología genere retorno real, debe combinar un diseño 100% personalizado, carga rápida, integración con WhatsApp y formularios inteligentes que capturen clientes. Conoce la metodología de DIGITAL HOME para construir sistemas digitales completos.',
    imageUrl: 'https://lh3.googleusercontent.com/d/13_pJH4OVTJC1K-WVamiY9c5M81fPcT6H'
  },
  {
    id: 'b3',
    title: 'Branding e Impacto Tangible: La importancia de proyectar tu marca en el mundo físico y digital',
    category: 'Branding & Merchandising',
    date: '08 Jul 2026',
    readTime: '4 min lectura',
    summary: 'Alinear tu identidad de marca digital con merchandising corporativo de alta calidad genera confianza y recordación constante en tus clientes.',
    content: 'El valor percibido de una empresa aumenta drásticamente cuando existe coherencia entre su presencia digital y su presentación física. Desde el Manual de Identidad hasta empaques, papelería y uniformes corporativos, proyectar profesionalismo en cada punto de contacto con el cliente marca la diferencia competitiva.',
    imageUrl: 'https://lh3.googleusercontent.com/d/1O-ttOZgUT_7fvWpJ21d0T7HHM6eyS6b0'
  }
];

export const ACCORDION_FAQ_DATA = [
  {
    id: 'faq1',
    question: '¿Por qué elegir DIGITAL HOME?',
    answer: 'Porque no somos una agencia de publicidad tradicional. Somos un aliado estratégico que reúne en un solo equipo estrategia de marca, diseño, desarrollo, inteligencia artificial, automatización, merchandising y soporte continuo para acelerar la transformación digital de tu empresa.'
  },
  {
    id: 'faq2',
    question: '¿Qué significa que crean "sistemas completos"?',
    answer: 'En DIGITAL HOME no vendemos páginas web aisladas, ni logotipos sueltos, ni software sin propósito. Cada proyecto integra estrategia, diseño, tecnología y automatización para que la inversión del cliente produzca resultados reales en ventas, captura de clientes y eficiencia operativa.'
  },
  {
    id: 'faq3',
    question: '¿Cómo funcionan los Agentes de Inteligencia Artificial 24/7?',
    answer: 'Desarrollamos asistentes virtuales inteligentes entrenados con la información de tu empresa. Se integran a WhatsApp, correo electrónico, sitio web y CRM para atender a tus clientes de inmediato, calificar prospectos y agendar citas de forma automática a cualquier hora.'
  },
  {
    id: 'faq4',
    question: '¿Qué incluye el servicio de Páginas Web y Tiendas Online?',
    answer: 'Dominio + Hosting (1 año), diseño 100% personalizado adaptado a móviles, integración con WhatsApp y redes sociales, geolocalización en Google Maps, correos corporativos, certificado de seguridad SSL, catálogo y pasarela de pagos para las tiendas online.'
  }
];

