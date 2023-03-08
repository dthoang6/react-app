import React, { useEffect, useContext } from "react"
import DispatchContext from "../DispatchContext"
import { useImmer } from "use-immer"
import Axios from "axios"
import { Link } from "react-router-dom"
import Post from "./Post"

function Search() {
  const appDispatch = useContext(DispatchContext)

  const [state, setState] = useImmer({
    searchTerm: "",
    //fetch JSON data from server and the posts that match the search term will live in this results property.
    results: [],
    //at appropriate time, we can set this to either be loading icon or results.
    show: "neither",
    requestCount: 0
  })

  //user press esc keyboard to close search overlay
  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler)
    //clean up function to remove if Search component is unmounted
    return () => document.removeEventListener("keyup", searchKeyPressHandler)
  }, [])

  //run code to handle search input
  useEffect(() => {
    if (state.searchTerm.trim()) {
      //show loading icon when user start to type
      setState(draft => {
        draft.show = "loading"
      })
      //handle user type search term
      const delay = setTimeout(() => {
        setState(draft => {
          draft.requestCount++
        })
      }, 750)
      //cancel the setTimeout with clean up function
      return () => clearTimeout(delay)
    } else {
      setState(draft => {
        draft.show = "neither"
      })
    }
  }, [state.searchTerm])

  //send axios request, this won't run when the component first renders.
  useEffect(() => {
    if (state.requestCount) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/search", { searchTerm: state.searchTerm }, { cancelToken: ourRequest.token })

          setState(draft => {
            draft.results = response.data
            draft.show = "results"
          })
        } catch (e) {
          console.log("There was a problem or the request was cancelled.")
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [state.requestCount])

  function searchKeyPressHandler(e) {
    if (e.keycode == 27) {
      appDispatch({ type: "closeSearch" })
    }
  }

  function handleInput(e) {
    const value = e.target.value
    setState(draft => {
      draft.searchTerm = value
    })
  }

  return (
    <div className="search-overlay">
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input onChange={handleInput} autoFocus type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
          <span onClick={() => appDispatch({ type: "closeSearch" })} className="close-live-search">
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div className={"circle-loader" + (state.show == "loading" ? "circle-loader--visible" : "")}></div>

          <div className={"live-search-results" + (state.show == "results" ? "live-search-results--visible" : "")}>
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.results.length} {state.results.length > 1 ? "items" : "item"} found)
                </div>

                {state.results.map(post => {
                  return <Post post={post} key={post._id} onClick={() => appDispatch({ type: "closeSearch" })} />
                })}
              </div>
            )}

            {!Boolean(state.results.length) && <div className="alert alert-danger text-center shadow-sm">Sorry, We could not find any results for that search. </div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search
