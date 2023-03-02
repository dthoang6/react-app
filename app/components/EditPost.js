import React, { useContext, useEffect, useState } from "react"
import { useImmerReducer } from "use-immer"
import Page from "./Page"
import { useParams, Link, useNavigate } from "react-router-dom"
import Axios from "axios"
import LoadingDotsIcon from "./LoadingDotsIcon"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import NotFound from "./NotFound"

function EditPost() {
  const navigate = useNavigate()
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const originalState = {
    title: {
      value: "",
      hasErrors: false,
      message: ""
    },
    body: {
      value: "",
      hasErrors: false,
      message: ""
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id, //pull the id from the url
    sendCount: 0, //keep track of how many times we've tried to send an Axios request
    notFound: false
  }
  //all of our logic live in ourReducer
  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.value.title
        draft.body.value = action.value.body
        draft.isFetching = false
        return
      case "titleChange":
        draft.title.hasErrors = false
        draft.title.value = action.value
        return
      case "bodyChange":
        draft.body.hasErrors = false
        draft.body.value = action.value
        return
      case "submitRequest":
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          //client side validation
          draft.sendCount++
        }
        return
      case "saveRequestStarted":
        draft.isSaving = true
        return
      case "saveRequestFinished":
        draft.isSaving = false
        return
      case "titleRules": //client side validation
        if (!action.value.trim()) {
          draft.title.hasErrors = true
          draft.title.message = "You must provide a title."
        }
        return
      case "bodyRules": //client side validation
        if (!action.value.trim()) {
          draft.body.hasErrors = true
          draft.body.message = "You must provide a body."
        }
        return
      case "notFound":
        draft.notFound = true
        return
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, originalState)
  /*   const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [post, setPost] = useState([]) */

  function submitHandler(e) {
    e.preventDefault()
    dispatch({ type: "titleRules", value: state.title.value }) //client side validation
    dispatch({ type: "bodyRules", value: state.body.value }) //client side validation

    dispatch({ type: "submitRequest" })
  }
  //the code the send off an axios request live in useEffect that watches this piece of state, originalState, for changes
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, { cancelToken: ourRequest.token })
        if (response.data) {
          dispatch({ type: "fetchComplete", value: response.data })
          if (appState.user.username != response.data.author.username) {
            appDispatch({ type: "flashMessage", value: "You do not have permission to edit the post." })
            navigate("/")
          }
        } else {
          dispatch({ type: "notFound" })
        }
      } catch (e) {
        console.log("There was a problem or the request was cancelled.")
      }
    }
    fetchPost()
    //clean up function: cancel this axios request when component is unmounted
    return () => {
      //identify the request
      ourRequest.cancel()
    }
  }, [])
  //for second send request to update in database when sendCount is > 0, not when first loading
  useEffect(() => {
    if (state.sendCount > 0) {
      dispatch({ type: "saveRequestStarted" })
      const ourRequest = Axios.CancelToken.source()
      async function fetchPost() {
        try {
          const response = await Axios.post(`/post/${state.id}/edit`, { title: state.title.value, body: state.body.value, token: appState.user.token }, { cancelToken: ourRequest.token })
          dispatch({ type: "saveRequestFinished" })
          appDispatch({ type: "flashMessage", value: "Post was updated." })
        } catch (e) {
          console.log("There was a problem or the request was cancelled.")
        }
      }
      fetchPost()
      //clean up function: cancel this axios request when component is unmounted
      return () => {
        //identify the request
        ourRequest.cancel()
      }
    }
  }, [state.sendCount])

  if (state.notFound) {
    return <NotFound />
  }
  if (state.isFetching) {
    return (
      <Page>
        <LoadingDotsIcon />
      </Page>
    )
  }

  return (
    <Page title="Edit Post">
      <form onSubmit={submitHandler}>
        <Link className="small font-weight-bold" to={`/post/${state.id}`}>
          &laquo; Back to post
        </Link>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>

          <input onBlur={e => dispatch({ type: "titleRules", value: e.target.value })} onChange={e => dispatch({ type: "titleChange", value: e.target.value })} value={state.title.value} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />

          {state.title.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.title.message}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>

          <textarea onBlur={e => dispatch({ type: "bodyRules", value: e.target.value })} onChange={e => dispatch({ type: "bodyChange", value: e.target.value })} name="body" id="post-body" className="body-content tall-textarea form-control" type="text" value={state.body.value} />

          {state.body.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.body.message}</div>}
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          Save Update
        </button>
      </form>
    </Page>
  )
}

export default EditPost
