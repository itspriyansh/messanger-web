import React, { useState } from 'react';
import { Container, Row, Col, Card, CardImg, CardBody,
    CardTitle, Button, Form, FormGroup, Input, Label } from 'reactstrap';
import { Redirect } from 'react-router-dom';

function handleChange(event, setValue) {
    const field = event.target.name, value = event.target.value;
    let valid = true;
    if(field === 'phone') {
        if(value.indexOf('+91 ') === -1 || value.length > 14 || isNaN(Number(value.substr(4)))) {
            valid = false;
        }
    } else {
        if(value.length > 6 || isNaN(Number(value))) {
            valid = false;
        }
    }
    if(valid) setValue(value);
}

function Login(props) {
    const [phone, setPhone] = useState('+91 ');
    const [otp, setOtp] = useState('');
    const [phoneProvided, setPhoneProvided] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        if(phoneProvided) {
            console.log("ekjwo");
            props.login(phone, otp, 'Priyansh');
        }
        setPhoneProvided(true);
    }

    if(props.user) {
        return (<Redirect to='/home' />);
    }

    return(
        <Container>
            <Row>
                <Col xs="0" sm="2" md="3"></Col>
                <Col xs="12" sm="8" md="6">
                    <Card style={{padding: 30, marginTop: 100}}>
                        <CardImg top style={{width: '30%', alignSelf: 'center'}} src={require('../images/Email-512.png')} />
                        <CardBody>
                            <CardTitle style={{textAlign: 'center', fontSize: 30, fontWeight: 'bold'}}>Login</CardTitle>
                            <Form onSubmit={handleSubmit}>
                                <FormGroup>
                                    {!phoneProvided
                                    ? <><Label>Enter Phone No.</Label><Input type="tel" value={phone}
                                    name="phone" id="phone"
                                    placeholder="Phone No. here" autoFocus
                                    onChange={(event) => handleChange(event, setPhone)} /></>
                                    : <Input type="tel" name="otp" value={otp}
                                    id="otp" placeholder="OTP here" autoFocus
                                    onChange={(event) => handleChange(event, setOtp)} />}
                                </FormGroup>
                                <Button color="primary" style={{width: '100%'}}
                                disabled={(phoneProvided && otp.length<6) || (!phoneProvided && phone.length<14)}>Submit</Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;