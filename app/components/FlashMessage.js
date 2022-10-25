import React, { useEffect } from "react";

function FlashMessage(props) {
  return (
    <div className="floating-alerts">
      {props.messages.map((msg, index) => {
        return (
          //in react, whenever looping through a collection and outputting a component for each item in the collection, add key
          <div key={index} className="alert alert-success text-center floating-alert shadow-sm">
            {msg}
          </div>
        );
      })}
    </div>
  );
}

export default FlashMessage;
