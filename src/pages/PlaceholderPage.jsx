export default function PlaceholderPage({ title, note }) {
  return (
    <>
      <h1 className="page-title">{title}</h1>
      <p className="page-subtitle">{note}</p>
      <div className="placeholder-page">Esta sección todavía no está construida.</div>
    </>
  )
}
