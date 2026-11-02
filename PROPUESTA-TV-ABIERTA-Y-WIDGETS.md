# Propuesta: Panel de TV abierta y widgets

## Objetivo

Mantener una señal de televisión por internet dentro del Panel Multimedia, sin abandonar la app, con información útil alrededor y control opcional desde un teléfono.

## Distribución recomendada para 1920 x 1080

- Área izquierda: video principal en proporción 16:9.
- Columna derecha superior: hora y fecha.
- Columna derecha central: notificaciones o alertas importantes.
- Columna derecha inferior: noticias nacionales y del mundo en rotación.
- Franja inferior: tiempo actual de Santiago y pronóstico de siete días.

## Fuentes de video

- La aplicación puede reproducir señales HLS por internet que sean legales, públicas y compatibles con webOS 4.
- Cada señal se validará en la TV antes de incorporarla de forma permanente.
- No se agregarán listas IPTV de origen desconocido ni enlaces que el canal no autorice para reproducción externa.
- El sintonizador físico de TV abierta del televisor no se puede insertar dentro de una app webOS de terceros; la fuente debe ser una transmisión online.

## Control con el teléfono

Segunda etapa propuesta:

1. Mostrar un código QR de vinculación en la TV.
2. Abrir en el teléfono un control web sencillo.
3. Permitir cambiar canal, silenciar, activar audio, pausar y actualizar widgets.
4. Enviar los comandos mediante un pequeño servicio en tiempo real. GitHub Pages seguirá alojando la interfaz, pero se necesitará un servicio como Firebase o Supabase para transportar comandos.
5. No almacenar contraseñas de IPTV ni cuentas personales en el repositorio público.

## Widgets recomendados

### Siempre visibles

- Hora y fecha.
- Tiempo actual y pronóstico de siete días.
- Titulares de Chile y del mundo.
- Estado del canal y programa actual.

### Opcionales en rotación

- Programa actual y siguiente programa (EPG).
- Estado del Metro de Santiago y alertas de transporte.
- Calidad del aire e índice UV de Santiago.
- Alertas de SENAPRED o avisos comunales.
- UF, UTM, dólar observado e IPC.
- Calendario familiar y recordatorios.
- Resultados deportivos seleccionados.
- Estado de dispositivos del hogar, si más adelante se integra domótica.

## Etapas

1. Pronóstico meteorológico de siete días: implementado localmente.
2. Validar dos o tres señales oficiales de TV abierta online en el LG real.
3. Crear selector de canales con el control remoto.
4. Agregar programa actual/siguiente cuando exista una fuente EPG fiable.
5. Crear el control desde el teléfono mediante QR y conexión en tiempo real.
