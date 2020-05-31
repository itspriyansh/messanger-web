import React, { useState } from 'react';
import { Navbar, NavbarBrand, Media, Dropdown, DropdownToggle, DropdownMenu,DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faEllipsisV } from '@fortawesome/free-solid-svg-icons';

function Header(props) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const toggle = () => setDropdownOpen(prevState => !prevState);

    return(
        <Navbar color="primary" light className="sticky-top" expand="md">
            {props.back
            ? <FontAwesomeIcon onClick={() => props.history.goBack()} icon={faArrowLeft} size="lg" style={{color: "white", marginRight: 20}} />
            : null}
            {props.icon
            ? <Media>
                <Media style={{width: 50, marginRight: 20, borderRadius: '50%'}} object src={props.icon} alt="Profile Picture" />
            </Media>
            : null}
            <Media body>
                <NavbarBrand className="text-light">
                    {props.title}
                </NavbarBrand>
            </Media>
            {props.dropdownOptions
            ?   <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                    <DropdownToggle color="primary">
                        <FontAwesomeIcon icon={faEllipsisV} size="lg" className="ml-auto text-light" />
                    </DropdownToggle>
                    <DropdownMenu right>
                        {props.dropdownOptions.map((item,index) => {
                            return(
                                <DropdownItem  key={index}>
                                    {item.name}
                                </DropdownItem >
                            );
                        })}
                    </DropdownMenu>
                </Dropdown>
            : null}
        </Navbar>
    );
}

export default Header;