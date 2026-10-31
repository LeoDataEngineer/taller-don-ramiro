export function formatDate(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function buildWhatsAppLink(car, baseUrl) {
  const link = `${baseUrl}#/cliente/${car.token}`
  const msg = encodeURIComponent(
    `Hola ${car.client}! 👋\n\nTe enviamos el link de seguimiento de tu *${car.model}* (Patente: ${car.plate}) en el *Taller Don Ramiro*.\n\nPodés ver el estado de tu vehículo aquí:\n${link}\n\n✅ Sin contraseña, solo hacé clic.`
  )
  const phone = car.phone.replace(/\D/g, '')
  return `https://wa.me/${phone}?text=${msg}`
}
