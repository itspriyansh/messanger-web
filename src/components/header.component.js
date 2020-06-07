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
            ? <FontAwesomeIcon className="cursor-pointer" onClick={() => props.history.goBack()} icon={faArrowLeft} size="lg" style={{color: "white", marginRight: 20}} />
            : null}
            {props.icon
            ? <Media>
                <Media style={{width: 50, marginRight: 20, borderRadius: '50%'}} object src={props.icon} alt="Profile Picture" />
            </Media>
            : null}
            <Media body className="cursor-pointer" onClick={() => {if(props.link) props.history.push(props.link);}}>
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
                                <React.Fragment key={index}>
                                    <DropdownItem  key={index} onClick={item.onClick}>
                                    <FontAwesomeIcon icon={item.icon} />{'  '}{item.name}
                                    </DropdownItem >
                                    {index < props.dropdownOptions.length-1
                                    ? <DropdownItem divider />
                                    : null}
                                </React.Fragment>
                            );
                        })}
                    </DropdownMenu>
                </Dropdown>
            : null}
        </Navbar>
    );
}

export default Header;