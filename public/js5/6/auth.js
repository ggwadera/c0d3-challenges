const Auth = {}

const endpoint = "https://ggwdr.freedomains.dev/"

const authContainer = (type) => {
  const url = `${endpoint}/auth/api/${type}`
  return (userInfo) => {
    const data = {
      ...userInfo,
    }
    data.password = btoa(data.password)
    return fetch(url, {
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    })
      .then((r) => r.json())
      .then((body) => {
        if (body.error) {
          alert(body.error)
        }
        return body
      })
  }
}

Auth.login = authContainer("session")
Auth.signup = authContainer("users")
Auth.getSession = () => {
  return fetch(`${endpoint}/auth/api/session`, {
    credentials: "include",
  }).then((r) => r.json())
}
window.Auth = Auth
