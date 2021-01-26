import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import DropzoneComponent from 'react-dropzone-component'
import { navigate } from 'hookrouter'

import '../../node_modules/react-dropzone-component/styles/filepicker.css'
import '../../node_modules/dropzone/dist/min/dropzone.min.css'


export default function MemeForm (props) {
  const imageRef = useRef(null)
  const [text, setText] = useState('')
  const [favorite, setFavorite] = useState(false)
  const [image, setImage] = useState('https://source.unsplash.com/random')

  const componentConfig = () => {
    return {
      iconFiletypes: ['.jpg', '.png'], 
      showFiletypeIcon: true,
      postUrl: "https://httpbin.org/post"
    }
  }
  const djsConfig = () => {
    return {
      addRemoveLinks: true,
      maxFiles: 1
    }
  }
  const handleDrop = () => {
    return {
      addedfile: file => {
        const formData = new FormData()

        formData.append("upload_preset", "meme-images")
        formData.append("file", file)

        fetch("https://api.cloudinary.com/v1_1/dod28syz3/image/upload", {
          method: "POST",
          body: formData
        })
        .then(res => res.json())
        .then(data => {
          setImage(data.secure_url)
        })
        .catch(err => console.error(err))
      }
    }
  }
  const editSubmit = () => {
    fetch(`https://jdm-meme-flask-api.herokuapp.com/meme/${props.id}`, {
      method: 'PUT', 
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }, 
      body: JSON.stringify({
        text,
        favorite
      })
    })
    .then(() => imageRef.current.dropzone.removeAllFiles())
    .then(() => navigate('/'))
    .catch(err => console.error(err))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    switch(!props.id) {
      case false:
        editSubmit()
        break
      default:
        axios
        .post("http://jdm-meme-flask-api.herokuapp.com/add-meme", {
          text, 
          favorite,
          image
        })
        .then(() => {
          setText(""),
          setImage(""),
          setFavorite(false)
          imageRef.current.dropzone.removeAllFiles()
        })
        .catch(err => console.error(err))
    }   
  }
  useEffect(() => {
    if(props.id){
    fetch(`https://jdm-meme-flask-api.herokuapp.com/meme/${props.id}`)
    .then(res =>res.json())
    .then(data => {
      setText(data.text)
      setFavorite(data.favorite)
    })
    .catch(err => console.error(err))
    }
  }, [])
  return (
    <div>
      <h1>{props.id ? "Edit Meme" : "Post Meme"}</h1>

      <form onSubmit={handleSubmit}>
        <DropzoneComponent 
          ref={imageRef}
          config={componentConfig()}
          djsConfig={djsConfig()}
          eventHandlers={handleDrop()}
          >
          Drop that sweet meme yo!
        </DropzoneComponent>
        <input
          type='text'
          placeholder='enter a caption'
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <input
          type='checkbox'
          checked={favorite}
          onChange={() => setFavorite(!favorite)}
        />
        <span>Favorite?</span>
        <button type='submit'>{props.id ? "Edit Meme" : "Post Meme"}</button>
      </form>
    </div>
  )
}