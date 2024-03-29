import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import Axios from "axios"
import LoadingDotsIcon from "./LoadingDotsIcon"
import Post from "./Post"

function ProfilePost() {
  const { username } = useParams() //dynamic variable
  //keep track if loading or not. as long as this is true we show an animated loading icon. otherwise, show the real content.
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, { cancelToken: ourRequest.token })
        setPosts(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log("There was a problem.")
      }
    }
    fetchPosts()
    //clean up function: cancel this axios request when component is unmounted
    return () => {
      //identify the request
      ourRequest.cancel()
    }
  }, [username])

  if (isLoading) {
    return <LoadingDotsIcon />
  }
  return (
    <div className="list-group">
      {posts.map(post => {
        return <Post noAuthor={true} post={post} key={post._id} />
      })}
    </div>
  )
}

export default ProfilePost
