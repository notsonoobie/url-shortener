import React, { useState } from 'react';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import Logo from './logo.svg'

function App() {
  const [done, setDone] = useState(true)
  const [show, setShow] = useState(false)
  const [errMsg, setErrMsg] = useState({sts:'',text:'',msg:''})
  const [url,setUrl] = useState('')
  const [data, setData] = useState(JSON.parse(window.localStorage.getItem('url-data')) || [])
  const handleChange = (e) => {
    setUrl(e.target.value)
  }
  const handleSubmit = async (e) => {
    setShow(false)
    setErrMsg(undefined)
    setDone(false)
    e.preventDefault()
    let response = await fetch('/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"url": url})
    });
    if(response.status === 302 || response.status === 201){

      let result = await response.json()
      if(window.localStorage.getItem('url-data')){
        let arr = JSON.parse(window.localStorage.getItem('url-data'))
        arr.push(result)
        window.localStorage.setItem('url-data',JSON.stringify(arr))
        setData(JSON.parse(window.localStorage.getItem('url-data')))
      }else{
        let arr = []
        arr.push(result)
        window.localStorage.setItem('url-data',JSON.stringify(arr))
        setData(JSON.parse(window.localStorage.getItem('url-data')))
      }

    }else{
      // ERROR HANDELING
      let err = await response.json()
      setErrMsg({
        sts: response.status,
        text: response.statusText,
        msg: err.message
      })
      setShow(true)
    }
    setDone(true)
    setUrl('')
  }
  return (
    <Container style={{minHeight: '100vh',display:'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Row className="justify-content-center">
        {
          show && (
            <Col xs={10}>
              <Alert variant="danger" onClose={() => setShow(false)} dismissible>
                <Alert.Heading>{`${errMsg.sts}! - ${errMsg.text}`}</Alert.Heading>
                <p>
                  {errMsg.msg}
                </p>
              </Alert>
            </Col>
          )
        }
        <Card>
          <Card.Img style={{width: '10rem', margin: '0 auto'}} variant="top" src={Logo} />
          <Card.Body>
            <Col>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                      <InputGroup.Text id="url">URL</InputGroup.Text>
                    </InputGroup.Prepend>
                      <Form.Control
                        aria-label="Url"
                        aria-describedby="url"
                        type='text'
                        value={url}
                        onChange={handleChange}
                      />
                  </InputGroup>
                </Row>
                <Row xs={12} className='mb-5'>
                  <Button style={{width: '100%', padding: '1rem'}} variant="dark" type='submit'> {done ? 'Shortify' : <Spinner animation="border" variant="light" />}</Button>
                </Row>
              </Form>
            </Col>
            {
              data.length>0 && (
                <Row style={{maxHeight: '40vh', overflowY: 'auto'}}>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Url</th>
                          <th>Shortened</th>
                          <th>Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          data.map((elm,i) => (
                            <tr key={i}>
                              <td>{i}</td>
                              <td>{elm.url}</td>
                              <td><a className='text-success' href={elm.fullUrl} target='_blank' rel="noopener noreferrer">{elm.fullUrl}</a></td>
                              <td>{Date(elm.createdAt)}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </Table>  
                </Row>                                                
              )
            }
          </Card.Body>
        </Card>
      </Row>
  </Container>
  );
}

export default App;
