import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

function Loading(props) {
    return(
        <div>
            <FontAwesomeIcon icon={faSpinner} pulse className="text-primary"
                style={{marginTop: props.marginTop?props.marginTop:'45vh',
                marginLeft: '45%',
                fontSize: 50,
                marginBottom: props.marginBottom?props.marginBottom:'0'}} />
        </div>
    );
}

export default Loading;