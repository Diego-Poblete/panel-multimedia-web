// Configuración pública para la versión alojada en HTTPS.
// No guardes credenciales, listas M3U privadas, usuarios, contraseñas ni tokens aquí.
window.PANEL_CONFIG = {
  city: 'Santiago de Chile',
  latitude: -33.4489,
  longitude: -70.6693,
  timeZone: 'America/Santiago',
  video: {
    initialSource: 'youtube',
    initialChannel: 0,
    channels: [
      {
        name: 'Demostración HLS',
        group: 'PRUEBA HLS',
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
      }
    ],
    youtube: {
      requiresHttpsHost: false,
      // Video de demostración utilizado en la documentación oficial de YouTube.
      videoId: 'M7lc1UVf-VE',
      title: 'YouTube · video de demostración'
    }
  },
  news: {
    refreshMinutes: 20,
    headlineSeconds: 10,
    sources: [
      {
        section: 'CHILE',
        name: 'Radio Cooperativa',
        url: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss____1.xml'
      },
      {
        section: 'MUNDO',
        name: 'DW Español',
        url: 'https://rss.dw.com/rdf/rss-sp-all'
      }
    ]
  },
  notifications: [
    {
      title: 'Panel listo',
      text: 'Versión web HTTPS para YouTube y widgets laterales.'
    }
  ]
};
