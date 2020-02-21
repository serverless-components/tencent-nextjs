import fetch from 'isomorphic-unfetch'
import Head from 'next/head'

function AsyncPage({ name, site }) {
  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className="description">
          Get started by editing <code>pages/async.js</code>
        </p>

        <div className="grid">
          <a href={site} target="_blank" className="external-link">{ name }</a>
        </div>
        <div className="grid">
          <div className="card" onClick={() => window.history.back()}>Back</div>
        </div>
      </main>

      <footer>
        <a
          href="https://zeit.co?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by <img src="/zeit.svg" alt="ZEIT Logo" />
        </a>
      </footer>

      <style jsx>{`
      .external-link {
        text-decoration: underline;
      }
      `}</style>
  </div>
  )
}

AsyncPage.getInitialProps = async ({ req }) => {
  const res = await fetch('https://www.mocky.io/v2/5e4e54922f00004e0016a5f8')
  const json = await res.json()
  return json
}

export default AsyncPage
