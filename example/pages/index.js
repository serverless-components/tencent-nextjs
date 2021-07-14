import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href={`${process.env.STATIC_URL || ''}/favicon.ico`} />
      </Head>

      <main>
        <h1 className={styles.title}>Welcome to Next.js!</h1>

        <p className={styles.description}>
          Get started by editing <code>pages/index.js</code>
        </p>
        <p className={styles.description}>
          The SSR app is hosted on&nbsp;
          <a href="https://cloud.tencent.com/product/ssr" target="_blank" rel="noopener noreferrer">
            Serverless SSR
          </a>
        </p>
      </main>
    </div>
  )
}
