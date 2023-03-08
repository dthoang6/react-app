import React, { useEffect, useContext, useState } from "react"
import Page from "./Page"
import { useParams, NavLink, Routes, Route } from "react-router-dom"
import Axios from "axios"
import StateContext from "../StateContext"
import ProfilePost from "./ProfilePost"
import { useImmer } from "use-immer"
import ProfileFollower from "./ProfileFollower"
import ProfileFollowing from "./ProfileFollowing"

function Profile() {
  const { username } = useParams()
  const appState = useContext(StateContext)

  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: {
        postCount: "",
        followerCount: "",
        followingCount: ""
      }
    }
  })
  //fetch data for profile every time the user or username in the url change.
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchData() {
      try {
        const response = await Axios.post(`/profile/${username}`, { token: appState.user.token }, { cancelToken: ourRequest.token })

        setState(draft => {
          draft.profileData = response.data
        })
      } catch (e) {
        console.log("There was a problem.")
      }
    }
    fetchData()
    return () => ourRequest.cancel()
  }, [username])

  //setup a useEffect to watch the property startFollowingRequestCount change
  //it only run if the startFollowingRequestCount is greater than 0.
  useEffect(() => {
    if (state.startFollowingRequestCount) {
      //the button should appear grayed out
      setState(draft => {
        draft.followActionLoading = true
      })
      const ourRequest = Axios.CancelToken.source()
      async function fetchData() {
        try {
          const response = await Axios.post(`/addFollow/${state.profileData.profileUsername}`, { token: appState.user.token }, { cancelToken: ourRequest.token })

          setState(draft => {
            draft.profileData.isFollowing = true
            draft.profileData.counts.followerCount++
            draft.followActionLoading = false
          })
        } catch (e) {
          console.log("There was a problem.")
        }
      }
      fetchData()
      return () => ourRequest.cancel()
    }
  }, [state.startFollowingRequestCount])

  //setup a useEffect to watch the property stopFollowingRequestCount change
  //it only run if the stopFollowingRequestCount is greater than 0.
  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      //the button should appear grayed out
      setState(draft => {
        draft.followActionLoading = true
      })
      const ourRequest = Axios.CancelToken.source()
      async function fetchData() {
        try {
          const response = await Axios.post(`/removeFollow/${state.profileData.profileUsername}`, { token: appState.user.token }, { cancelToken: ourRequest.token })

          setState(draft => {
            draft.profileData.isFollowing = false
            draft.profileData.counts.followerCount--
            draft.followActionLoading = false
          })
        } catch (e) {
          console.log("There was a problem.")
        }
      }
      fetchData()
      return () => ourRequest.cancel()
    }
  }, [state.stopFollowingRequestCount])

  function startFollowing() {
    setState(draft => {
      draft.startFollowingRequestCount++
    })
  }
  function stopFollowing() {
    setState(draft => {
      draft.stopFollowingRequestCount++
    })
  }

  return (
    <Page title="Profile Screen">
      <h2>
        <img alt="" className="avatar-small" src={state.profileData.profileAvatar} />

        {state.profileData.profileUsername}

        {appState.loggedIn && !state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != "..." && (
          <button onClick={startFollowing} disabled={state.followActionLoading} className="btn btn-primary btn-sm ml-2">
            Follow <i className="fas fa-user-plus"></i>
          </button>
        )}

        {appState.loggedIn && state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != "..." && (
          <button onClick={stopFollowing} disabled={state.followActionLoading} className="btn btn-danger btn-sm ml-2">
            Stop Following <i className="fas fa-user-times"></i>
          </button>
        )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink to="" end className="nav-item nav-link">
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink to="followers" className="nav-item nav-link">
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink to="following" className="nav-item nav-link">
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>

      <Routes>
        <Route path="" element={<ProfilePost />} />
        <Route path="followers" element={<ProfileFollower />} />
        <Route path="following" element={<ProfileFollowing />} />
      </Routes>
    </Page>
  )
}

export default Profile
