import React, { Component } from 'react';
import { Card, CardImg, CardBody, Container, Row, Col, Form, FormGroup, Input, Label, Button } from 'reactstrap';
import Header from './header.component';
import baseurl from '../shared/baseurl';
import UploadPicture from './upload-picture.component';
import Loading from './loading.component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faCheck, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const borderBottom = {
    borderBottom: '1px grey solid'
};

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.user.name,
            uploadPictureModal: false,
            editName: false
        }
        this.toggleUploadPictureModal = this.toggleUploadPictureModal.bind(this);
        this.toggleEditName = this.toggleEditName.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleNameSubmit = this.handleNameSubmit.bind(this);
    }

    toggleUploadPictureModal() {
        this.setState({uploadPictureModal: !this.state.uploadPictureModal});
    }

    toggleEditName() {
        this.setState({editName: !this.state.editName});
    }

    handleNameChange(event) {
        this.setState({name: event.target.value});
    }

    handleNameSubmit() {
        this.toggleEditName();
        if(this.props.user.name !== this.state.name) {
            this.props.myProfile
            ? this.props.updateProfileName(this.state.name)
            : this.props.updateChatName(this.props.user._id, this.state.name);
        }
    }

    render() {
        return(
            <>
                <Header title='Profile Details' back={!this.props.myProfile} history={this.props.history} />
                <Container>
                    <Row>
                        <Col xs={0} sm={2} md={4}></Col>
                        <Col xs={12} sm={8} md={4}>
                            <Card className="mt-4">
                                <CardBody className="d-flex" style={{flexDirection: 'column'}}>
                                    {this.props.isPictureLoading
                                    ? <Loading marginTop='10vh' marginBottom='10vh' />
                                    : <>
                                        <CardImg src={baseurl+this.props.user.image}
                                            style={{width: '40%', alignSelf: 'center'}}
                                            alt="Profile"
                                            className="img-fluid rounded-circle mt-4 mb-2"
                                        />
                                        {this.props.myProfile
                                        ? <div className="mb-4 d-flex" style={{justifyContent: 'space-around'}}> 
                                            <FontAwesomeIcon icon={faPencilAlt} className="text-secondary"
                                                onClick={this.toggleUploadPictureModal} style={{cursor: 'pointer'}} />
                                            {this.props.user.image.indexOf('default')===-1
                                            ? <FontAwesomeIcon icon={faTimes} className="text-danger"
                                                style={{cursor: 'pointer'}} onClick={this.props.resetProfilePicture} />
                                            : null}
                                            </div>
                                        : null}
                                    </>}
                                    {!this.state.editName
                                    ? <div className="mt-4 pb-1" style={borderBottom}>
                                        <span className="font-weight-bold">
                                            Name:{' '}
                                        </span>
                                        {this.props.isNameLoading
                                        ? <FontAwesomeIcon icon={faSpinner} pulse />
                                        : (this.props.user.name?this.props.user.name:'')}
                                        <span className="float-right">
                                            {this.props.isNameLoading
                                            ? null
                                            : <FontAwesomeIcon icon={faPencilAlt}
                                                onClick={this.toggleEditName}
                                                className="text-secondary" style={{cursor: 'pointer'}}/>
                                            }
                                        </span>
                                    </div>
                                    : <Form inline style={{display: 'flex', justifyContent: 'space-between'}}>
                                        <FormGroup>
                                            <Label className="font-weight-bold" for="myName">Name:{' '}</Label>
                                            <Input placeholder="Enter Name Here" name="myName"
                                            value={this.state.name} onChange={this.handleNameChange} />
                                        </FormGroup>
                                        <FontAwesomeIcon className="text-success cursor-pointer" icon={faCheck}
                                            size='lg' onClick={this.handleNameSubmit} />
                                        <FontAwesomeIcon className="text-danger cursor-pointer" icon={faTimes}
                                            size='lg' onClick={this.toggleEditName} />
                                    </Form>}
                                    <div className="my-4 pb-1" style={borderBottom}>
                                        <span className="font-weight-bold">
                                            Phone:
                                        </span>
                                        {' '+this.props.user.phone}
                                    </div>
                                </CardBody>
                                {this.props.myProfile
                                ? <Link to='/home'>
                                    <Button color="primary" className="m-2">Done</Button>
                                </Link>
                                : null}
                            </Card>
                        </Col>
                    </Row>
                </Container>
                {this.props.myProfile
                ? <UploadPicture open={this.state.uploadPictureModal}
                    toggle={this.toggleUploadPictureModal}
                    uploadProfilePicture={this.props.uploadProfilePicture} />
                : null}
            </>
        );
    }
}

export default Profile;