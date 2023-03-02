import React from "react"
import { Link } from "react-router-dom"
import Page from "./Page"

function NotFound() {
  return (
    <Page title="Not Found">
      <div className="text-center">
        <h2>Whoops, we cannot find that page.</h2>
        <p>
          You can always visit the <Link to="/">homepage</Link> to get the fresh start.
        </p>
      </div>
    </Page>
  )
}

export default NotFound
