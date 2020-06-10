import React, { useState } from 'react';
import { Container, Row, Col, Card, CardImg, CardBody,
    CardTitle, Button, Form, FormGroup, Input, Label, CardText } from 'reactstrap';
import Loading from './loading.component';

function handleChange(event, setValue) {
    const field = event.target.name, value = event.target.value;
    let valid = true;
    if(field === 'phone') {
        if(value.indexOf('+91 ') !== 0 || value.length > 14 || isNaN(Number(value.substr(4)))) {
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
    const [phone, setPhone] = useState(props.user.phone);
    const [otp, setOtp] = useState('');
    const phoneProvided = props.user.color !== 'red';

    const handleSubmit = (event) => {
        event.preventDefault();
        if(phoneProvided) {
            props.verifyOtp(phone,otp);
            return;
        }
        props.login(phone);
    }

    if(props.user.isLoading) {
        return <Loading />;
    }

    if(props.user.user) {
        if(!props.user.user.name){
            return this.props.history.push('/profile');
        }
        return this.props.history.push('/home');
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
                            <CardText style={{color: props.user.color}}>{props.user.errMess}</CardText>
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
                                disabled={(phoneProvided && otp.length<6) || (!phoneProvided && phone.length<14)}>
                                    {phoneProvided ? 'Submit' : 'Confirm'}
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;