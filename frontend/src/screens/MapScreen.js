import axios from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  LoadScript,
  GoogleMap,
  StandaloneSearchBox,
  Marker,
} from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const defaultLocation = { lat: 45.516, lng: -73.56 };
const libs = ['places'];

export default function MapScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  const [googleApiKey, setGoogleApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState(defaultLocation);
  const [location, setLocation] = useState(defaultLocation);

  const mapRef = useRef(null);
  const placeRef = useRef(null);

  // Get user current location
  const getUserCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCenter(coords);
        setLocation(coords);
      },
      () => toast.error('Permission denied for location')
    );
  };

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const { data } = await axios('/api/keys/google', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setGoogleApiKey(data.key);
        getUserCurrentLocation();
      } catch (err) {
        toast.error('Failed to load Google Maps');
      } finally {
        setLoading(false);
      }
    };

    fetchKey();

    ctxDispatch({ type: 'SET_FULLBOX_ON' });
  }, [ctxDispatch, userInfo]);

  const onLoad = (map) => {
    mapRef.current = map;
  };

  const onIdle = () => {
    if (!mapRef.current) return;
    setLocation({
      lat: mapRef.current.center.lat(),
      lng: mapRef.current.center.lng(),
    });
  };

  const onLoadPlaces = (place) => {
    placeRef.current = place;
  };

  const onPlacesChanged = () => {
    const places = placeRef.current.getPlaces();
    if (!places || places.length === 0) return;

    const place = places[0];
    if (!place.geometry) return;

    const coords = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    setCenter(coords);
    setLocation(coords);
  };

  const onConfirm = () => {
    const places = placeRef.current?.getPlaces() || [];

    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS_MAP_LOCATION',
      payload: {
        lat: location.lat,
        lng: location.lng,
        address: places[0]?.formatted_address || '',
        name: places[0]?.name || '',
        vicinity: places[0]?.vicinity || '',
        googleAddressId: places[0]?.place_id || '',
      },
    });

    toast.success('Location selected successfully');
    navigate('/shipping');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="full-box">
      <LoadScript libraries={libs} googleMapsApiKey={googleApiKey}>
        <GoogleMap
          mapContainerStyle={{ height: '100%', width: '100%' }}
          center={center}
          zoom={15}
          onLoad={onLoad}
          onIdle={onIdle}
        >
          <StandaloneSearchBox
            onLoad={onLoadPlaces}
            onPlacesChanged={onPlacesChanged}
          >
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="map-input-box shadow-lg rounded-4 p-3 bg-white"
              style={{
                position: 'absolute',
                top: '15px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                width: '90%',
                maxWidth: '500px',
              }}
            >
              <input
                type="text"
                placeholder="Search your address..."
                className="form-control mb-2"
              />
              <Button
                type="button"
                variant="primary"
                className="w-100"
                onClick={onConfirm}
              >
                Confirm Location
              </Button>
            </motion.div>
          </StandaloneSearchBox>

          <Marker position={location} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

