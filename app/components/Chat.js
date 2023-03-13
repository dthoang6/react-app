import React, { useContext, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import { useImmer } from "use-immer"
import io from "socket.io-client"
const socket = io("http://localhost:8080") //establish an ongoing connection between the browser and our backend server.

function Chat() {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  //a references is like a box that we can hold value in and free to directly mutate it. React will not re-render things when your reference changes. Now we add a props ref={chatField} to the input element to imperatively to do something.
  const chatField = useRef(null)
  const chatLog = useRef(null)

  const [state, setState] = useImmer({
    fieldValue: "",
    chatMessages: []
  })

  useEffect(() => {
    if (appState.isChatOpen) {
      //focus to input field
      //treat this like any other DOM element
      chatField.current.focus()
      //reset chat count action when chat is open
      appDispatch({ type: "clearUnreadChatCount" })
    }
  }, [appState.isChatOpen])

  //listen for server send us a message
  useEffect(() => {
    socket.on("chatFromServer", message => {
      setState(draft => {
        draft.chatMessages.push(message)
      })
    })
  }, []) //only run the first time it is rendered

  useEffect(() => {
    //scroll to top automatically
    //chatLog.current is the DOM element in the context of React
    chatLog.current.scrollTop = chatLog.current.scrollHeight

    //increment the unread messages
    if (state.chatMessages.length && !appState.isChatOpen) {
      appDispatch({ type: "incrementUnreadChatCount" })
    }
  }, [state.chatMessages])

  function handleFieldChange(e) {
    const value = e.target.value
    setState(draft => {
      draft.fieldValue = value
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    // send message to chat server
    socket.emit("chatFromBrowser", { message: state.fieldValue, token: appState.user.token })

    setState(draft => {
      // add message to state collection of messages
      draft.chatMessages.push({ message: draft.fieldValue, username: appState.user.username, avatar: appState.user.avatar })
      draft.fieldValue = ""
    })
  }

  return (
    <div id="chat-wrapper" className={"chat-wrapper shadow border-top border-left border-right " + (appState.isChatOpen ? "chat-wrapper--is-visible" : "")}>
      <div className="chat-title-bar bg-primary">
        Chat
        <span onClick={() => appDispatch({ type: "closeChat" })} className="chat-title-bar-close">
          <i className="fas fa-times-circle"></i>
        </span>
      </div>

      <div id="chat" className="chat-log" ref={chatLog}>
        {state.chatMessages.map((message, index) => {
          if (message.username == appState.user.username) {
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img alt="" className="chat-avatar avatar-tiny" src={message.avatar} />
              </div>
            )
          }
          return (
            <div key={index} className="chat-other">
              <Link to={`/profile/${message.username}`}>
                <img className="avatar-tiny" src={message.avatar} />
              </Link>
              <div className="chat-message">
                <div className="chat-message-inner">
                  <Link to={`/profile/${message.username}`}>
                    <strong>{message.username}: </strong>
                  </Link>
                  {message.message}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} id="chatForm" className="chat-form border-top">
        <input value={state.fieldValue} onChange={handleFieldChange} ref={chatField} type="text" className="chat-field" id="chatField" placeholder="Type a message…" autoComplete="off" />
      </form>
    </div>
  )
}

export default Chat
