import React, { useEffect, useRef, useState } from 'react';
import { Plus, Plane, BedDouble, Trash2, Edit2, Route, Ticket, Fuel, CheckSquare, Square } from 'lucide-react';

const transportLabels = {
  CAR: 'Carro',
  BUS: 'Onibus',
  PLANE: 'Aviao',
  VAN: 'Van',
  OTHER: 'Outro'
};

const accommodationOptions = [
  'Hotel',
  'Chacara',
  'Apartamento',
  'Pousada',
  'Hostel',
  'Casa'
];

const itineraryTypeLabels = {
  BREAKFAST: 'Cafe da manha',
  AFTERNOON: 'Cafe da tarde',
  TOUR: 'Ponto turistico',
  SHOP: 'Lojas',
  LUNCH: 'Almoco',
  DINNER: 'Jantar',
  DESSERT: 'Sobremesa',
  OTHER: 'Outros'
};

const itineraryTypeIcons = {
  BREAKFAST: '🥐',
  AFTERNOON: '☀️',
  TOUR: '📍',
  SHOP: '🛍️',
  LUNCH: '🍽️',
  DINNER: '🍷',
  DESSERT: '🍰',
  OTHER: '📝'
};

const itineraryTypeOrder = ['BREAKFAST', 'AFTERNOON', 'TOUR', 'SHOP', 'LUNCH', 'DINNER', 'DESSERT', 'OTHER'];

const itineraryTypePillColors = {
  BREAKFAST: { background: '#fff7ed', border: '#fdba74', color: '#9a3412' },
  AFTERNOON: { background: '#fefce8', border: '#fde047', color: '#854d0e' },
  TOUR: { background: '#eff6ff', border: '#93c5fd', color: '#1d4ed8' },
  SHOP: { background: '#fdf2f8', border: '#f9a8d4', color: '#9d174d' },
  LUNCH: { background: '#ecfdf5', border: '#86efac', color: '#166534' },
  DINNER: { background: '#eef2ff', border: '#a5b4fc', color: '#4338ca' },
  DESSERT: { background: '#fdf4ff', border: '#e9d5ff', color: '#7e22ce' },
  OTHER: { background: '#f8fafc', border: '#cbd5e1', color: '#334155' }
};

function getItineraryTypePillStyle(type) {
  const palette = itineraryTypePillColors[type] || itineraryTypePillColors.OTHER;
  return {
    background: palette.background,
    border: `1px solid ${palette.border}`,
    color: palette.color
  };
}


function toMoney(value) {
  return Number(value || 0).toFixed(2);
}

function formatDateBr(value) {
  if (!value) return '';
  const parts = String(value).split('-');
  if (parts.length !== 3) return value;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatTime(value) {
  if (!value) return '';
  return String(value).slice(0, 5);
}

function buildTripDraft(trip) {
  return {
    destination_name: trip?.destination_name || '',
    departure_date: trip?.departure_date || '',
    return_date: trip?.return_date || '',
    total_distance: trip?.total_distance || '',
    transport_type: trip?.transport_type || 'CAR',
    toll_total: trip?.toll_total || '0.00',
    fuel_estimate: trip?.fuel_estimate || '0.00'
  };
}

function buildAccommodationDraft(item) {
  return {
    accommodation_type: item?.accommodation_type || 'Hotel',
    accommodation_name: item?.accommodation_name || '',
    entry_date: item?.entry_date || item?.event_date || '',
    exit_date: item?.exit_date || '',
    checkin_time: item?.checkin_time || item?.event_time || '',
    checkout_time: item?.checkout_time || '',
    expected_value: item?.expected_value || item?.accommodation_total || '0.00',
    real_value: item?.real_value || item?.accommodation_total || '0.00',
    notes: item?.notes || ''
  };
}

function buildItineraryDraft(item) {
  return {
    item_type: 'OTHER',
    description: item?.description || '',
    event_date: item?.event_date || '',
    notes: ''
  };
}

function groupItineraryByType(items) {
  const groups = itineraryTypeOrder.map((type) => ({ type, items: [] }));
  const map = new Map(groups.map((g) => [g.type, g]));
  (items || []).forEach((item) => {
    if (map.has(item.item_type)) map.get(item.item_type).items.push(item);
  });
  return groups.filter((g) => g.items.length > 0);
}

function sortByDateTime(items) {
  return [...(items || [])].sort((a, b) => {
    const aDate = a.event_date || '9999-12-31';
    const bDate = b.event_date || '9999-12-31';
    if (aDate !== bDate) return aDate.localeCompare(bDate);

    const aTime = a.event_time || '23:59:59';
    const bTime = b.event_time || '23:59:59';
    if (aTime !== bTime) return aTime.localeCompare(bTime);

    return (a.description || a.accommodation_name || '').localeCompare(
      b.description || b.accommodation_name || '',
      'pt-BR'
    );
  });
}

function groupItemsByDate(items) {
  const grouped = new Map();
  sortByDateTime(items).forEach((item) => {
    const key = item.event_date || 'Sem data';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  });
  return Array.from(grouped.entries()).map(([date, rows]) => ({
    date,
    displayDate: date === 'Sem data' ? date : formatDateBr(date),
    rows
  }));
}

function groupAccommodationByEntryDate(items) {
  const grouped = new Map();
  const sorted = [...(items || [])].sort((a, b) => {
    const aDate = a.entry_date || a.event_date || '9999-12-31';
    const bDate = b.entry_date || b.event_date || '9999-12-31';
    if (aDate !== bDate) return aDate.localeCompare(bDate);

    const aTime = a.checkin_time || a.event_time || '23:59:59';
    const bTime = b.checkin_time || b.event_time || '23:59:59';
    if (aTime !== bTime) return aTime.localeCompare(bTime);

    return (a.accommodation_name || '').localeCompare(b.accommodation_name || '', 'pt-BR');
  });

  sorted.forEach((item) => {
    const key = item.entry_date || item.event_date || 'Sem data';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  });

  return Array.from(grouped.entries()).map(([date, rows]) => ({
    date,
    displayDate: date === 'Sem data' ? date : formatDateBr(date),
    rows
  }));
}

function getTripSummary(trip) {
  const tollTotal = Number(trip.toll_total || 0);
  const fuelEstimate = Number(trip.fuel_estimate || 0);
  const accommodationExpected = (trip.accommodation_items || []).reduce(
    (sum, item) => sum + Number(item.expected_value || item.accommodation_total || 0),
    0
  );
  const accommodationReal = (trip.accommodation_items || []).reduce(
    (sum, item) => sum + Number(item.real_value || item.accommodation_total || 0),
    0
  );
  const legacyAccommodationTotal = Number(trip.accommodation_total || 0);
  const mergedAccommodationExpected = accommodationExpected || legacyAccommodationTotal;
  const mergedAccommodationReal = accommodationReal || legacyAccommodationTotal;
  const comboExpected = (trip.combo_items || []).reduce((sum, item) => sum + Number(item.expected_value || 0), 0);
  const comboReal = (trip.combo_items || []).reduce((sum, item) => sum + Number(item.real_value || 0), 0);
  const itineraryExpected = (trip.itinerary_items || []).reduce((sum, item) => sum + Number(item.expected_value || item.value || 0), 0);
  const itineraryReal = (trip.itinerary_items || []).reduce((sum, item) => sum + Number(item.real_value || item.value || 0), 0);
  const expectedTotal = tollTotal + fuelEstimate + mergedAccommodationExpected + comboExpected + itineraryExpected;
  const realTotal = tollTotal + fuelEstimate + mergedAccommodationReal + comboReal + itineraryReal;

  return {
    expectedTotal,
    realTotal,
    difference: realTotal - expectedTotal,
    accommodationExpected: mergedAccommodationExpected,
    accommodationReal: mergedAccommodationReal,
    itineraryExpected,
    itineraryReal,
    comboExpected,
    comboReal
  };
}

// Module-level cache so it loads once regardless of re-renders
let _ibgeMunicipios = [];
let _ibgeLoading = false;
const _placesCache = new Map();

function normalizeSearchText(value) {
  return (value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function resolveUfCode(address) {
  const iso = address?.['ISO3166-2-lvl4'];
  if (iso && iso.startsWith('BR-')) return iso.slice(3);
  return address?.state || '';
}

function mergeSuggestions(primary, secondary) {
  const seen = new Set();
  const merged = [];

  [...primary, ...secondary].forEach((item) => {
    if (!item?.label || seen.has(item.label)) return;
    seen.add(item.label);
    merged.push(item);
  });

  return merged.slice(0, 7);
}

function loadIbgeMunicipios() {
  if (_ibgeMunicipios.length || _ibgeLoading) return;
  _ibgeLoading = true;
  fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome')
    .then((r) => r.json())
    .then((data) => {
      _ibgeMunicipios = data
        .filter((m) => m.microrregiao?.mesorregiao?.UF?.sigla)
        .map((m) => ({
          label: `${m.nome}, ${m.microrregiao.mesorregiao.UF.sigla}`,
          city: m.nome,
          state: m.microrregiao.mesorregiao.UF.nome,
          kind: 'municipio'
        }));
    })
    .catch(() => { _ibgeLoading = false; });
}

async function searchLocalPlaces(query) {
  if (!query || query.trim().length < 2) return [];

  const key = normalizeSearchText(query.trim());
  if (_placesCache.has(key)) return _placesCache.get(key);

  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=br&limit=7&q=${encodeURIComponent(`${query}, Brasil`)}`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
  const data = await res.json();

  const mapped = data
    .map((item) => {
      const address = item.address || {};
      const locality = item.name
        || address.village
        || address.neighbourhood
        || address.suburb
        || address.hamlet
        || address.city
        || address.town
        || address.municipality
        || '';
      const uf = resolveUfCode(address);
      if (!locality || !uf || !item.lat || !item.lon) return null;

      return {
        label: `${locality}, ${uf}`,
        lat: item.lat,
        lon: item.lon,
        kind: 'localidade'
      };
    })
    .filter(Boolean);

  _placesCache.set(key, mapped);
  return mapped;
}

function filterMunicipios(query) {
  if (!query || query.length < 2 || !_ibgeMunicipios.length) {
    return [];
  }
  const q = normalizeSearchText(query);
  const results = _ibgeMunicipios
    .filter((m) => normalizeSearchText(m.label).includes(q))
    .slice(0, 7);
  return results;
}

export default function TravelScreen({ API_URL }) {
  const [trips, setTrips] = useState([]);
  const [activeTripId, setActiveTripId] = useState(null);
  const [expandedTripId, setExpandedTripId] = useState(null);
  const [tripDraft, setTripDraft] = useState(buildTripDraft());
  const [editingTripId, setEditingTripId] = useState(null);
  const [itineraryDraft, setItineraryDraft] = useState([buildItineraryDraft()]);
  const [editingItineraryId, setEditingItineraryId] = useState(null);
  const [accommodationDraft, setAccommodationDraft] = useState(buildAccommodationDraft());
  const [editingAccommodationId, setEditingAccommodationId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isTripRegisterOpen, setIsTripRegisterOpen] = useState(false);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [pickerState, setPickerState] = useState({ open: false, type: null });
  const [tripFormModal, setTripFormModal] = useState({ open: false, type: null });
  const [routeOrigin, setRouteOrigin] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [originCoords, setOriginCoords] = useState(null);
  const [routeDestination, setRouteDestination] = useState('');
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState('6.50');
  const [kmPerLiter, setKmPerLiter] = useState('15');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [mapsLink, setMapsLink] = useState('');
  const [isRouteSectionOpen, setIsRouteSectionOpen] = useState(false);
  const originQueryRef = useRef('');
  const destinationQueryRef = useRef('');

  const fetchTrips = () => {
    setIsLoadingTrips(true);
    fetch(`${API_URL}/travel-plans/`)
      .then((res) => res.json())
      .then((data) => {
        setTrips(data);
        if (!activeTripId && data.length > 0) {
          setActiveTripId(data[0].id);
        }
        if (data.length === 0) {
          setActiveTripId(null);
          setExpandedTripId(null);
        }
      })
      .catch((error) => console.error('Erro ao carregar viagens:', error))
      .finally(() => setIsLoadingTrips(false));
  };

  useEffect(() => {
    fetchTrips();
    loadIbgeMunicipios();
  }, []);

  useEffect(() => {
    if (!successMessage) return undefined;

    const timeout = setTimeout(() => setSuccessMessage(''), 1800);
    return () => clearTimeout(timeout);
  }, [successMessage]);

  const handleOriginChange = async (value) => {
    setRouteOrigin(value);
    setOriginCoords(null);
    originQueryRef.current = value;

    const municipios = filterMunicipios(value);
    if (!value || value.trim().length < 3) {
      setOriginSuggestions(municipios);
      return;
    }

    try {
      const locais = await searchLocalPlaces(value);
      if (originQueryRef.current !== value) return;
      setOriginSuggestions(mergeSuggestions(municipios, locais));
    } catch {
      if (originQueryRef.current !== value) return;
      setOriginSuggestions(municipios);
    }
  };

  const handleDestinationChange = async (value) => {
    setRouteDestination(value);
    setDestinationCoords(null);
    destinationQueryRef.current = value;

    const municipios = filterMunicipios(value);
    if (!value || value.trim().length < 3) {
      setDestinationSuggestions(municipios);
      return;
    }

    try {
      const locais = await searchLocalPlaces(value);
      if (destinationQueryRef.current !== value) return;
      setDestinationSuggestions(mergeSuggestions(municipios, locais));
    } catch {
      if (destinationQueryRef.current !== value) return;
      setDestinationSuggestions(municipios);
    }
  };

  const activeTrip = trips.find((trip) => trip.id === activeTripId) || null;
  const summary = activeTrip ? getTripSummary(activeTrip) : null;

  const handleCalculateRoute = async () => {
    if (!routeOrigin.trim() || !routeDestination.trim()) return;
    setRouteLoading(true);
    setRouteError('');
    setMapsLink('');
    try {
      const geocode = async (city, state) => {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=Brazil&format=json&limit=1`,
          { headers: { 'Accept-Language': 'pt-BR' } }
        );
        const data = await res.json();
        if (!data.length) throw new Error(`Municipio nao encontrado: "${city}, ${state}"`);
        return { lat: data[0].lat, lon: data[0].lon };
      };

      const geocodeQuery = async (query) => {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=br&limit=1&q=${encodeURIComponent(`${query}, Brasil`)}`,
          { headers: { 'Accept-Language': 'pt-BR' } }
        );
        const data = await res.json();
        if (!data.length) throw new Error(`Local nao encontrado: "${query}"`);
        return { lat: data[0].lat, lon: data[0].lon };
      };

      const getCoords = async (coords, query) => {
        if (coords && coords.lat) return coords;
        if (coords && coords.city) return geocode(coords.city, coords.state);
        const match = _ibgeMunicipios.find(
          (m) => m.label.toLowerCase() === query.toLowerCase()
        );
        if (match) return geocode(match.city, match.state);
        return geocodeQuery(query);
      };

      const [origin, destination] = await Promise.all([
        getCoords(originCoords, routeOrigin),
        getCoords(destinationCoords, routeDestination)
      ]);

      const osrmRes = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=false`
      );
      const osrmData = await osrmRes.json();
      if (osrmData.code !== 'Ok' || !osrmData.routes.length) throw new Error('Rota nao encontrada');

      const distanceKm = Math.round(osrmData.routes[0].distance / 1000);
      const fuelLiters = distanceKm / Number(kmPerLiter || 10);
      let fuelCost = (fuelLiters * Number(fuelPricePerLiter || 6.5)).toFixed(2);
      if (isRoundTrip) {
        fuelCost = (Number(fuelCost) * 2).toFixed(2);
      }

      setTripDraft((prev) => ({
        ...prev,
        total_distance: distanceKm,
        fuel_estimate: fuelCost,
        destination_name: prev.destination_name || routeDestination
      }));
      setMapsLink(
        `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(routeOrigin)}&destination=${encodeURIComponent(routeDestination)}`
      );
    } catch (err) {
      setRouteError(err.message || 'Erro ao calcular rota');
    } finally {
      setRouteLoading(false);
    }
  };

  const handleOpenMaps = () => {
    if (!mapsLink) return;
    const isAndroid = /Android/i.test(navigator.userAgent || '');

    if (isAndroid) {
      const intentUrl = `intent://maps.google.com/maps/dir/?api=1&origin=${encodeURIComponent(routeOrigin)}&destination=${encodeURIComponent(routeDestination)}#Intent;scheme=https;package=com.google.android.apps.maps;S.browser_fallback_url=${encodeURIComponent(mapsLink)};end`;
      window.location.href = intentUrl;
      return;
    }

    const popup = window.open(mapsLink, '_blank', 'noopener,noreferrer');
    if (!popup) {
      window.location.href = mapsLink;
    }
  };

  const resetTripForm = () => {
    setTripDraft(buildTripDraft());
    setEditingTripId(null);
    setIsRoundTrip(false);
  };

  const resetItineraryForm = () => {
    setItineraryDraft([buildItineraryDraft()]);
    setEditingItineraryId(null);
  };

  const resetAccommodationForm = () => {
    setAccommodationDraft(buildAccommodationDraft());
    setEditingAccommodationId(null);
  };

  const openTripFormModal = (type, tripId) => {
    setActiveTripId(tripId);
    if (type === 'itinerary' && !editingItineraryId) {
      setItineraryDraft([buildItineraryDraft()]);
    }
    if (type === 'accommodation' && !editingAccommodationId) {
      setAccommodationDraft(buildAccommodationDraft());
    }
    setTripFormModal({ open: true, type });
  };

  const closeTripFormModal = () => {
    setTripFormModal({ open: false, type: null });
    resetItineraryForm();
    resetAccommodationForm();
  };

  const openPicker = (type) => {
    setPickerState({ open: true, type });
  };

  const closePicker = () => {
    setPickerState({ open: false, type: null });
  };

  const handleSaveTrip = async (e) => {
    e.preventDefault();
    if (!tripDraft.destination_name.trim()) return;

    const payload = {
      ...tripDraft,
      departure_date: tripDraft.departure_date || null,
      return_date: tripDraft.return_date || null,
      total_distance: Number(tripDraft.total_distance || 0),
      toll_total: Number(tripDraft.toll_total || 0),
      fuel_estimate: Number(tripDraft.fuel_estimate || 0)
    };

    const isEditing = Boolean(editingTripId);
    const url = isEditing ? `${API_URL}/travel-plans/${editingTripId}/` : `${API_URL}/travel-plans/`;
    const method = isEditing ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      fetchTrips();
      return;
    }

    const savedTrip = await response.json();
    setTrips((prev) => {
      const nextTrips = isEditing
        ? prev.map((trip) => (trip.id === savedTrip.id ? { ...trip, ...savedTrip } : trip))
        : [savedTrip, ...prev];
      return nextTrips;
    });
    setActiveTripId(savedTrip.id);
    resetTripForm();
    setSuccessMessage(isEditing ? 'Viagem atualizada com sucesso' : 'Viagem criada com sucesso');
  };

  const handleEditTrip = (trip) => {
    setEditingTripId(trip.id);
    setTripDraft(buildTripDraft(trip));
    setActiveTripId(trip.id);
    setIsTripRegisterOpen(true);
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Excluir esta viagem?')) return;

    const previousTrips = trips;
    setTrips((prev) => prev.filter((trip) => trip.id !== tripId));
    if (activeTripId === tripId) {
      const nextTrip = trips.find((trip) => trip.id !== tripId);
      setActiveTripId(nextTrip ? nextTrip.id : null);
    }

    const response = await fetch(`${API_URL}/travel-plans/${tripId}/`, { method: 'DELETE' });

    if (!response.ok) {
      setTrips(previousTrips);
      fetchTrips();
      return;
    }

    resetTripForm();
  };

  const handleSaveItinerary = async (e) => {
    e.preventDefault();
    if (!activeTrip) return;

    const itemsToSave = itineraryDraft.filter(item => item.description.trim());
    if (itemsToSave.length === 0) return;

    const isEditing = Boolean(editingItineraryId);
    
    try {
      const savedItems = [];
      const sharedDate = itemsToSave[0].event_date || null;

      for (const itemDraft of itemsToSave) {
        const payload = {
          ...itemDraft,
          travel_plan: activeTrip.id,
          item_type: 'OTHER',
          event_date: sharedDate,
          event_time: null,
          expected_value: 0,
          real_value: 0,
          notes: null
        };

        const url = isEditing
          ? `${API_URL}/travel-itinerary-items/${editingItineraryId}/`
          : `${API_URL}/travel-itinerary-items/`;
        const method = isEditing ? 'PATCH' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const saved = await response.json();
          savedItems.push(saved);
        }
      }

      setTrips((prev) => prev.map((trip) => {
        if (trip.id !== activeTrip.id) return trip;
        const current = trip.itinerary_items || [];
        let next = [...current];
        
        savedItems.forEach(saved => {
          if (isEditing) {
            next = next.map(item => item.id === saved.id ? saved : item);
          } else {
            next = [saved, ...next];
          }
        });
        
        return { ...trip, itinerary_items: next };
      }));

      resetItineraryForm();
      setSuccessMessage(isEditing ? 'Roteiro atualizado' : `${savedItems.length} item(ns) adicionado(s)`);
      setTripFormModal({ open: false, type: null });
    } catch (error) {
      console.error('Erro ao salvar roteiros:', error);
      fetchTrips();
    }
  };

  const addItineraryRow = () => {
    setItineraryDraft(prev => {
      const last = prev[prev.length - 1];
      return [...prev, buildItineraryDraft({ event_date: last?.event_date || '' })];
    });
  };

  const removeItineraryRow = (index) => {
    if (itineraryDraft.length <= 1) return;
    setItineraryDraft(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditItinerary = (item, tripId = activeTrip?.id) => {
    if (tripId) setActiveTripId(tripId);
    setEditingItineraryId(item.id);
    setItineraryDraft([buildItineraryDraft(item)]);
    setTripFormModal({ open: true, type: 'itinerary' });
  };

  const handleDeleteItinerary = async (itemId, tripId = activeTrip?.id) => {
    if (!tripId) return;
    const previousTrips = trips;
    setTrips((prev) => prev.map((trip) => (
      trip.id === tripId
        ? { ...trip, itinerary_items: (trip.itinerary_items || []).filter((i) => i.id !== itemId) }
        : trip
    )));
    const response = await fetch(`${API_URL}/travel-itinerary-items/${itemId}/`, { method: 'DELETE' });
    if (!response.ok) {
      setTrips(previousTrips);
      fetchTrips();
      return;
    }
    if (editingItineraryId === itemId) resetItineraryForm();
  };

  const handleToggleItineraryCompleted = async (itemId, tripId, currentValue) => {
    const nextValue = !currentValue;
    const previousTrips = trips;

    setTrips((prev) => prev.map((trip) => (
      trip.id === tripId
        ? {
          ...trip,
          itinerary_items: (trip.itinerary_items || []).map((item) => (
            item.id === itemId ? { ...item, is_completed: nextValue } : item
          ))
        }
        : trip
    )));

    const response = await fetch(`${API_URL}/travel-itinerary-items/${itemId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed: nextValue })
    });

    if (!response.ok) {
      setTrips(previousTrips);
      fetchTrips();
    }
  };

  const handleSaveAccommodation = async (e) => {
    e.preventDefault();
    if (!activeTrip || !accommodationDraft.accommodation_name.trim() || !accommodationDraft.accommodation_type) return;

    const payload = {
      ...accommodationDraft,
      travel_plan: activeTrip.id,
      entry_date: accommodationDraft.entry_date || null,
      exit_date: accommodationDraft.exit_date || null,
      checkin_time: accommodationDraft.checkin_time || null,
      checkout_time: accommodationDraft.checkout_time || null,
      event_date: accommodationDraft.entry_date || null,
      event_time: accommodationDraft.checkin_time || null,
      expected_value: Number(accommodationDraft.expected_value || 0),
      real_value: Number(accommodationDraft.real_value || 0),
      accommodation_total: Number(accommodationDraft.real_value || 0),
      notes: accommodationDraft.notes || null
    };

    const isEditing = Boolean(editingAccommodationId);
    const url = isEditing
      ? `${API_URL}/travel-accommodation-items/${editingAccommodationId}/`
      : `${API_URL}/travel-accommodation-items/`;
    const method = isEditing ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      fetchTrips();
      return;
    }

    const saved = await response.json();
    setTrips((prev) => prev.map((trip) => {
      if (trip.id !== activeTrip.id) return trip;
      const current = trip.accommodation_items || [];
      const next = isEditing
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...current];
      return { ...trip, accommodation_items: next };
    }));

    resetAccommodationForm();
    setSuccessMessage(isEditing ? 'Acomodacao atualizada' : 'Acomodacao adicionada');
    setTripFormModal({ open: false, type: null });
  };

  const handleEditAccommodation = (item, tripId = activeTrip?.id) => {
    if (tripId) setActiveTripId(tripId);
    setEditingAccommodationId(item.id);
    setAccommodationDraft(buildAccommodationDraft(item));
    setTripFormModal({ open: true, type: 'accommodation' });
  };

  const handleDeleteAccommodation = async (itemId, tripId = activeTrip?.id) => {
    if (!tripId) return;
    const previousTrips = trips;
    setTrips((prev) => prev.map((trip) => (
      trip.id === tripId
        ? { ...trip, accommodation_items: (trip.accommodation_items || []).filter((i) => i.id !== itemId) }
        : trip
    )));
    const response = await fetch(`${API_URL}/travel-accommodation-items/${itemId}/`, { method: 'DELETE' });
    if (!response.ok) {
      setTrips(previousTrips);
      fetchTrips();
      return;
    }
    if (editingAccommodationId === itemId) resetAccommodationForm();
  };

  const handleToggleAccommodationCompleted = async (itemId, tripId, currentValue) => {
    const nextValue = !currentValue;
    const previousTrips = trips;

    setTrips((prev) => prev.map((trip) => (
      trip.id === tripId
        ? {
          ...trip,
          accommodation_items: (trip.accommodation_items || []).map((item) => (
            item.id === itemId ? { ...item, is_completed: nextValue } : item
          ))
        }
        : trip
    )));

    const response = await fetch(`${API_URL}/travel-accommodation-items/${itemId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed: nextValue })
    });

    if (!response.ok) {
      setTrips(previousTrips);
      fetchTrips();
    }
  };

  return (
    <div className="finances-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '20px', padding: '10px', borderRadius: '24px', background: 'linear-gradient(180deg, #f0f9ff 0%, #f8fafc 100%)' }}>
      <div className="card" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)', color: 'white', padding: '24px', border: 'none', boxShadow: '0 10px 20px rgba(15, 118, 110, 0.22)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div>
            <p style={{ opacity: 0.92, fontSize: '13px', fontWeight: '700', color: '#ccfbf1' }}>✈️ PLANEJADOR DE VIAGEM</p>
            <h2 style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '-1px', marginTop: '4px' }}>{activeTrip ? activeTrip.destination_name : 'Planeje sua viagem'}</h2>
            <p style={{ marginTop: '6px', fontSize: '13px', color: '#fff7ed' }}>
              {activeTrip ? `${transportLabels[activeTrip.transport_type] || activeTrip.transport_type} • ${Number(activeTrip.total_distance || 0).toFixed(0)} km` : 'Cadastre destino, transporte, hospedagem e roteiros em um unico lugar.'}
            </p>
          </div>
          <Plane size={28} />
        </div>
      </div>

      {successMessage && <div style={styles.successBanner}>{successMessage}</div>}

      <div className="card" style={{ padding: '20px' }}>
        <div style={styles.sectionHeader}>
          <button
            type="button"
            onClick={() => setIsTripRegisterOpen((prev) => !prev)}
            style={styles.sectionToggleButton}
          >
            <h3 style={styles.sectionTitle}>Cadastro de Viagem</h3>
            <span style={styles.smallText}>{isTripRegisterOpen ? 'Ocultar' : 'Abrir'}</span>
          </button>
          {editingTripId && isTripRegisterOpen && (
            <button onClick={resetTripForm} style={styles.secondaryTextButton}>Cancelar edicao</button>
          )}
        </div>
        {isTripRegisterOpen ? (
          <form onSubmit={handleSaveTrip} style={styles.formColumn}>
          <div style={styles.routeSection}>
            <button
              type="button"
              onClick={() => setIsRouteSectionOpen((prev) => !prev)}
              style={styles.routeToggleButton}
            >
              <span>🗺️ Calcular rota</span>
              <span>{isRouteSectionOpen ? 'Ocultar' : 'Abrir'}</span>
            </button>

            {isRouteSectionOpen ? (
              <>
                <div style={styles.routeRow}>
                  <div style={{ ...styles.fieldBlock, position: 'relative' }}>
                    <label style={styles.fieldLabel}>Origem</label>
                    <input
                      type="text"
                      placeholder="Ex: Sao Paulo - SP"
                      value={routeOrigin}
                      onChange={(e) => handleOriginChange(e.target.value)}
                      onBlur={() => setTimeout(() => setOriginSuggestions([]), 200)}
                      style={styles.input}
                      autoComplete="off"
                    />
                    {originSuggestions.length > 0 && (
                      <div style={styles.suggestionList}>
                        {originSuggestions.map((s) => (
                          <button
                            key={s.label}
                            type="button"
                            onMouseDown={() => {
                              setRouteOrigin(s.label);
                              if (s.lat && s.lon) {
                                setOriginCoords({ lat: s.lat, lon: s.lon });
                              } else {
                                setOriginCoords({ city: s.city, state: s.state });
                              }
                              setOriginSuggestions([]);
                            }}
                            style={styles.suggestionItem}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ ...styles.fieldBlock, position: 'relative' }}>
                    <label style={styles.fieldLabel}>Destino</label>
                    <input
                      type="text"
                      placeholder="Ex: Gramado - RS"
                      value={routeDestination}
                      onChange={(e) => handleDestinationChange(e.target.value)}
                      onBlur={() => setTimeout(() => setDestinationSuggestions([]), 200)}
                      style={styles.input}
                      autoComplete="off"
                    />
                    {destinationSuggestions.length > 0 && (
                      <div style={styles.suggestionList}>
                        {destinationSuggestions.map((s) => (
                          <button
                            key={s.label}
                            type="button"
                            onMouseDown={() => {
                              const label = s.label;
                              setRouteDestination(label);
                              if (s.lat && s.lon) {
                                setDestinationCoords({ lat: s.lat, lon: s.lon });
                              } else {
                                setDestinationCoords({ city: s.city, state: s.state });
                              }
                              setDestinationSuggestions([]);
                            }}
                            style={styles.suggestionItem}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={styles.routeRow}>
                  <div style={styles.fieldBlock}>
                    <label style={styles.fieldLabel}>Preco gasolina (R$/L)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="6.50"
                      value={fuelPricePerLiter}
                      onChange={(e) => setFuelPricePerLiter(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.fieldBlock}>
                    <label style={styles.fieldLabel}>Consumo do carro (km/L)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="10"
                      value={kmPerLiter}
                      onChange={(e) => setKmPerLiter(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      style={styles.input}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    id="roundTripCheckbox"
                    checked={isRoundTrip}
                    onChange={(e) => setIsRoundTrip(e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="roundTripCheckbox" style={{ cursor: 'pointer', fontSize: '14px', color: 'var(--text-main)', fontWeight: '600' }}>
                    Ida e volta? (dobra combustível)
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleCalculateRoute}
                    disabled={routeLoading || !routeOrigin.trim() || !routeDestination.trim()}
                    style={{ ...styles.primaryButton, background: routeLoading ? '#94a3b8' : '#0369a1', flex: 1, minWidth: '140px' }}
                  >
                    {routeLoading ? 'Calculando...' : '📍 Calcular distancia e combustivel'}
                  </button>
                  {mapsLink && (
                    <button type="button" onClick={handleOpenMaps} style={styles.mapsLink}>
                      Ver no Maps ↗
                    </button>
                  )}
                </div>
                {routeError && <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{routeError}</p>}
              </>
            ) : (
              <p style={styles.routeSectionTitle}>Clique para abrir o calculo de rota.</p>
            )}
          </div>

          <div style={styles.formGrid}>
            <div style={{ ...styles.fieldBlock, ...styles.fieldBlockFull }}>
              <label style={styles.fieldLabel}>Nome do destino</label>
              <input
                type="text"
                placeholder="Ex: Gramado - RS"
                value={tripDraft.destination_name}
                onChange={(e) => setTripDraft((prev) => ({ ...prev, destination_name: e.target.value }))}
                style={styles.input}
              />
            </div>
            <div style={styles.fieldBlock}>
              <label style={styles.fieldLabel}>Data de ida</label>
              <input
                type="date"
                value={tripDraft.departure_date}
                onChange={(e) => setTripDraft((prev) => ({ ...prev, departure_date: e.target.value }))}
                style={styles.input}
              />
            </div>
            <div style={styles.fieldBlock}>
              <label style={styles.fieldLabel}>Data de volta</label>
              <input
                type="date"
                value={tripDraft.return_date}
                onChange={(e) => setTripDraft((prev) => ({ ...prev, return_date: e.target.value }))}
                style={styles.input}
              />
            </div>
            <div style={styles.fieldBlock}>
              <label style={styles.fieldLabel}>Distancia total (km)</label>
              <input
                type="number"
                placeholder="0"
                value={tripDraft.total_distance}
                onChange={(e) => setTripDraft((prev) => ({ ...prev, total_distance: e.target.value }))}
                onFocus={(e) => e.target.select()}
                style={styles.input}
              />
            </div>
            <div style={styles.fieldBlock}>
              <label style={styles.fieldLabel}>Locomocao</label>
              <button
                type="button"
                onClick={() => openPicker('transport')}
                style={styles.selectTrigger}
              >
                {transportLabels[tripDraft.transport_type] || 'Locomocao'}
              </button>
            </div>
            <div style={styles.fieldBlock}>
              <label style={styles.fieldLabel}>Pedagios</label>
              <div style={styles.moneyInputWrapper}>
                <span style={styles.moneyPrefix}>R$</span>
                <input
                  type="number"
                  placeholder="0,00"
                  value={tripDraft.toll_total}
                  onChange={(e) => setTripDraft((prev) => ({ ...prev, toll_total: e.target.value }))}
                  onFocus={(e) => e.target.select()}
                  style={styles.moneyInput}
                />
              </div>
            </div>
            <div style={styles.fieldBlock}>
              <label style={styles.fieldLabel}>Combustivel estimado</label>
              <div style={styles.moneyInputWrapper}>
                <span style={styles.moneyPrefix}>R$</span>
                <input
                  type="number"
                  placeholder="0,00"
                  value={tripDraft.fuel_estimate}
                  onChange={(e) => setTripDraft((prev) => ({ ...prev, fuel_estimate: e.target.value }))}
                  onFocus={(e) => e.target.select()}
                  style={styles.moneyInput}
                  disabled={tripDraft.transport_type !== 'CAR'}
                />
              </div>
            </div>
          </div>
            <button type="submit" style={styles.primaryButton}>
              <Plus size={18} /> {editingTripId ? 'Salvar viagem' : 'Criar viagem'}
            </button>
          </form>
        ) : (
          <p style={{ ...styles.routeSectionTitle, margin: 0 }}>Toque em "Abrir" para cadastrar ou editar uma viagem.</p>
        )}
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Minhas viagens</h3>
          <span style={styles.smallText}>{trips.length} viagens</span>
        </div>
        {isLoadingTrips ? (
          <p style={{ ...styles.emptyState, background: '#f0fdfa', color: '#0f766e' }}>Carregando viagens...</p>
        ) : trips.length === 0 ? (
          <p style={styles.emptyState}>Nenhuma viagem cadastrada ainda.</p>
        ) : (
          <div style={styles.listColumn}>
            {trips.map((trip) => {
              const isActive = trip.id === activeTripId;
              const isExpanded = trip.id === expandedTripId;
              const tripSummary = getTripSummary(trip);
              const itineraryByDate = isExpanded ? groupItemsByDate(trip.itinerary_items || []) : [];
              const accommodationByDate = isExpanded ? groupAccommodationByEntryDate(trip.accommodation_items || []) : [];
              return (
                <div key={trip.id} style={{ ...styles.tripCard, ...(isActive ? styles.tripCardActive : {}) }}>
                  <div style={styles.tripCardTopRow}>
                    <div style={styles.tripCardMain}>
                      <button
                        onClick={() => {
                          setActiveTripId(trip.id);
                          setExpandedTripId((prev) => (prev === trip.id ? null : trip.id));
                        }}
                        style={styles.tripSelectArea}
                      >
                        <div>
                          <strong style={styles.tripName}>{trip.destination_name}</strong>
                          <span style={styles.tripMeta}>{transportLabels[trip.transport_type] || trip.transport_type} • {Number(trip.total_distance || 0).toFixed(0)} km</span>
                          {(trip.departure_date || trip.return_date) && (
                            <span style={styles.tripMeta}>🗓️ {trip.departure_date ? formatDateBr(trip.departure_date) : '-'} até {trip.return_date ? formatDateBr(trip.return_date) : '-'}</span>
                          )}
                          <span style={styles.tripMeta}>{(trip.itinerary_items || []).length} roteiros • {(trip.accommodation_items || []).length} acomodacoes</span>
                          <span style={styles.tripMeta}>Pedagios: R$ {toMoney(trip.toll_total)} • Combustivel: R$ {toMoney(trip.fuel_estimate)}</span>
                          <span style={styles.tripMeta}>Total previsto: R$ {toMoney(tripSummary.expectedTotal)} • Real: R$ {toMoney(tripSummary.realTotal)}</span>
                          <span style={styles.expandHint}>{isExpanded ? 'Toque para ocultar detalhes' : 'Toque para ver roteiros e acomodacoes'}</span>
                        </div>
                      </button>
                      <div style={styles.cardActionRow}>
                        <button type="button" onClick={() => openTripFormModal('itinerary', trip.id)} style={styles.smallActionButton}>
                          + Roteiro
                        </button>
                        <button type="button" onClick={() => openTripFormModal('accommodation', trip.id)} style={styles.smallActionButton}>
                          + Acomodacao
                        </button>
                      </div>
                    </div>
                    <div style={styles.inlineActions}>
                      <button onClick={() => handleEditTrip(trip)} style={styles.iconButton} title="Editar viagem">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteTrip(trip.id)} style={styles.iconButton} title="Excluir viagem">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={styles.tripDetailsPanel}>
                      <div style={styles.tripDetailsBlock}>
                        <div style={styles.sectionHeader}>
                          <h4 style={styles.tripDetailsTitle}>Roteiro</h4>
                          <span style={styles.smallText}>{(trip.itinerary_items || []).length} itens</span>
                        </div>
                        {(trip.itinerary_items || []).length === 0 ? (
                          <p style={styles.emptyState}>Nenhum roteiro adicionado para esta viagem.</p>
                        ) : (
                          <div style={styles.listColumn}>
                            {itineraryByDate.map((group) => (
                              <div key={`it-${trip.id}-${group.date}`} style={styles.groupCard}>
                                <div style={styles.groupTitleRow}>
                                  <strong style={styles.groupTitle}>{group.displayDate}</strong>
                                  <span style={styles.groupCount}>{group.rows.length} item{group.rows.length > 1 ? 's' : ''}</span>
                                </div>
                                {group.rows.map((item) => (
                                  <div key={item.id} style={styles.itemRowCard}>
                                    <div style={styles.itemTopRow}>
                                      <div style={styles.itemTopLeft}>
                                        <button
                                          type="button"
                                          onClick={() => handleToggleItineraryCompleted(item.id, trip.id, item.is_completed)}
                                          style={styles.checkButton}
                                          title={item.is_completed ? 'Marcar como pendente' : 'Marcar como concluido'}
                                        >
                                          {item.is_completed ? <CheckSquare size={18} color="#0f766e" /> : <Square size={18} color="#64748b" />}
                                        </button>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                          <span style={{ 
                                            ...styles.descriptionText, 
                                            fontWeight: '400', 
                                            fontSize: '14px',
                                            ...(item.is_completed ? styles.rowCompleted : {}) 
                                          }}>
                                            {item.description}
                                          </span>
                                          {item.notes && (
                                            <span style={{ 
                                              fontSize: '13px', 
                                              color: '#64748b', 
                                              whiteSpace: 'pre-wrap',
                                              ...(item.is_completed ? styles.rowCompleted : {})
                                            }}>
                                              {item.notes}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div style={styles.itemTopRight}>
                                        <div style={styles.simpleActionCell}>
                                          <button onClick={() => handleEditItinerary(item, trip.id)} style={styles.iconButton} title="Editar roteiro">
                                            <Edit2 size={16} />
                                          </button>
                                          <button onClick={() => handleDeleteItinerary(item.id, trip.id)} style={styles.iconButton} title="Excluir roteiro">
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={styles.detailsDivider} />

                        <div style={styles.sectionHeader}>
                          <h4 style={styles.tripDetailsTitle}>Acomodacoes</h4>
                          <span style={styles.smallText}>{(trip.accommodation_items || []).length} itens</span>
                        </div>
                        {(trip.accommodation_items || []).length === 0 ? (
                          <p style={styles.emptyState}>Nenhuma acomodacao adicionada para esta viagem.</p>
                        ) : (
                          <div style={styles.listColumn}>
                            {accommodationByDate.map((group) => (
                              <div key={`ac-${trip.id}-${group.date}`} style={styles.groupCard}>
                                <div style={styles.groupTitleRow}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <strong style={styles.groupTitle}>{group.displayDate}</strong>
                                    {Array.from(new Set(group.rows.map(r => r.accommodation_type || 'Acomodação'))).map((type, idx) => (
                                      <span key={idx} style={styles.secondaryTypePill}>
                                        {type}
                                      </span>
                                    ))}
                                  </div>
                                  <span style={styles.groupCount}>{group.rows.length} item{group.rows.length > 1 ? 's' : ''}</span>
                                </div>
                                {group.rows.map((item) => (
                                  <div key={item.id} style={styles.itemRowCard}>
                                    <div style={styles.itemTopRow}>
                                      <div style={styles.itemTopLeft}>
                                        <button
                                          type="button"
                                          onClick={() => handleToggleAccommodationCompleted(item.id, trip.id, item.is_completed)}
                                          style={styles.checkButton}
                                          title={item.is_completed ? 'Marcar como pendente' : 'Marcar como concluido'}
                                        >
                                          {item.is_completed ? <CheckSquare size={18} color="#0f766e" /> : <Square size={18} color="#64748b" />}
                                        </button>
                                        <div style={styles.itemMetaGroup}>
                                          <span style={{ ...styles.descriptionTextAccommodation, ...(item.is_completed ? styles.rowCompleted : {}) }}>
                                            {item.accommodation_name}
                                          </span>
                                        </div>
                                      </div>
                                      <div style={styles.itemTopRight}>
                                        <div style={styles.simpleActionCell}>
                                          <button onClick={() => handleEditAccommodation(item, trip.id)} style={styles.iconButton} title="Editar acomodacao">
                                            <Edit2 size={16} />
                                          </button>
                                          <button onClick={() => handleDeleteAccommodation(item.id, trip.id)} style={styles.iconButton} title="Excluir acomodacao">
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    <div style={styles.itemBottomRow}>
                                      <div style={styles.accommodationInfoBlock}>
                                        <span style={{ ...styles.simpleValueCell, fontSize: '14px' }}>R$ {toMoney(item.expected_value || item.accommodation_total)}</span>
                                        <div style={styles.accommodationMetaRow}>
                                          <div style={styles.accommodationPrimaryMetaRow}>
                                            {(item.entry_date || item.checkin_time || item.exit_date || item.checkout_time) && (
                                              <span style={{ ...styles.secondaryTypePill, background: '#f0fdfa', borderColor: '#99f6e4', color: '#0f766e' }}>
                                                📥 Check-in {item.entry_date ? formatDateBr(item.entry_date) : '--'} {item.checkin_time ? formatTime(item.checkin_time) : '--:--'}
                                              </span>
                                            )}
                                          </div>
                                        {(item.exit_date || item.checkout_time) && (
                                          <span style={{ ...styles.secondaryTypePill, background: '#fff7ed', borderColor: '#fdba74', color: '#c2410c' }}>
                                            📤 Check-out {item.exit_date ? formatDateBr(item.exit_date) : '--'} {item.checkout_time ? formatTime(item.checkout_time) : '--:--'}
                                          </span>
                                        )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeTrip && summary && (
        <div className="card" style={{ padding: '20px' }}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Resumo financeiro</h3>
            <span style={styles.smallText}>{activeTrip.destination_name}</span>
          </div>
          <div style={styles.summaryGrid}>
            <SummaryBox icon={<Route size={18} />} label="Distancia" value={`${Number(activeTrip.total_distance || 0).toFixed(0)} km`} />
            <SummaryBox icon={<Ticket size={18} />} label="Pedagios" value={`R$ ${toMoney(activeTrip.toll_total)}`} />
            <SummaryBox icon={<Fuel size={18} />} label="Combustivel" value={`R$ ${toMoney(activeTrip.fuel_estimate)}`} />
            <SummaryBox icon={<BedDouble size={18} />} label="Diarias (real)" value={`R$ ${toMoney(summary.accommodationReal)}`} />
          </div>
          <div style={styles.comparisonGrid}>
            <div style={styles.comparisonCard}>
              <span style={styles.comparisonLabel}>Total esperado</span>
              <strong style={styles.comparisonValue}>R$ {toMoney(summary.expectedTotal)}</strong>
            </div>
            <div style={styles.comparisonCard}>
              <span style={styles.comparisonLabel}>Total real</span>
              <strong style={styles.comparisonValue}>R$ {toMoney(summary.realTotal)}</strong>
            </div>
            <div style={styles.comparisonCard}>
              <span style={styles.comparisonLabel}>Diferenca</span>
              <strong style={{ ...styles.comparisonValue, color: summary.difference > 0 ? '#0369a1' : '#0f766e' }}>
                {summary.difference > 0 ? '+' : ''}R$ {toMoney(summary.difference)}
              </strong>
            </div>
          </div>
        </div>
      )}

      {tripFormModal.open && activeTrip && (
        <div style={styles.pickerOverlay} onClick={closeTripFormModal}>
          <div style={{ ...styles.pickerModal, maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.pickerHeader}>
              <h4 style={{ margin: 0 }}>
                {tripFormModal.type === 'itinerary'
                  ? (editingItineraryId ? 'Editar roteiro' : `Adicionar roteiro - ${activeTrip.destination_name}`)
                  : (editingAccommodationId ? 'Editar acomodacao' : `Adicionar acomodacao - ${activeTrip.destination_name}`)}
              </h4>
              <button type="button" onClick={closeTripFormModal} style={styles.closePickerBtn}>Fechar</button>
            </div>

            {tripFormModal.type === 'itinerary' ? (
              <form onSubmit={handleSaveItinerary} style={styles.formColumn}>
                <div style={{ ...styles.fieldBlock, marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <label style={styles.fieldLabel}>Data Geral do Roteiro</label>
                  <input
                    type="date"
                    value={itineraryDraft[0]?.event_date || ''}
                    onChange={(e) => setItineraryDraft(prev => prev.map(it => ({ ...it, event_date: e.target.value })))}
                    style={{ ...styles.input, width: '160px', fontSize: '16px', fontWeight: 'bold' }}
                  />
                </div>

                <div style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ ...styles.fieldLabel, marginBottom: '4px' }}>Itens (apenas descrição)</label>
                  {itineraryDraft.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="O que vamos fazer?"
                        value={item.description}
                        autoFocus={index === itineraryDraft.length - 1 && !editingItineraryId}
                        onChange={(e) => setItineraryDraft(prev => prev.map((it, i) => i === index ? { ...it, description: e.target.value } : it))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (item.description.trim()) addItineraryRow();
                          }
                        }}
                        style={{ ...styles.input, flex: 1 }}
                      />
                      {itineraryDraft.length > 1 && !editingItineraryId && (
                        <button 
                          type="button" 
                          onClick={() => removeItineraryRow(index)}
                          style={{
                            background: '#fee2e2',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ef4444',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                          title="Remover linha"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {!editingItineraryId && (
                  <button 
                    type="button" 
                    onClick={addItineraryRow}
                    style={{
                      marginTop: '12px',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '2px dashed #cbd5e1',
                      background: 'none',
                      color: '#64748b',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={16} /> Adicionar outro item (ou aperte Enter)
                  </button>
                )}

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                  <button type="submit" style={styles.primaryButton}>
                    {editingItineraryId ? 'Salvar Alteração' : `Salvar (${itineraryDraft.filter(i => i.description.trim()).length}) Item(ns)`}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveAccommodation} style={styles.formColumn}>
                <div style={styles.chipField}>
                  <span style={styles.chipFieldLabel}>Tipo de acomodacao</span>
                  <button
                    type="button"
                    onClick={() => openPicker('accommodation')}
                    style={styles.selectTrigger}
                  >
                    {accommodationDraft.accommodation_type || 'Acomodacao'}
                  </button>
                </div>
                <div style={styles.fieldBlock}>
                  <label style={styles.fieldLabel}>Nome da acomodacao</label>
                  <input
                    type="text"
                    placeholder="Ex: Hotel Vista do Lago"
                    value={accommodationDraft.accommodation_name}
                    onChange={(e) => setAccommodationDraft((prev) => ({ ...prev, accommodation_name: e.target.value }))}
                    style={styles.input}
                  />
                </div>
                <div style={styles.routeRow}>
                  <div style={styles.fieldBlock}>
                    <label style={styles.fieldLabel}>Data entrada</label>
                    <input
                      type="date"
                      value={accommodationDraft.entry_date}
                      onChange={(e) => setAccommodationDraft((prev) => ({ ...prev, entry_date: e.target.value }))}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.fieldBlock}>
                    <label style={styles.fieldLabel}>Data saida</label>
                    <input
                      type="date"
                      value={accommodationDraft.exit_date}
                      onChange={(e) => setAccommodationDraft((prev) => ({ ...prev, exit_date: e.target.value }))}
                      style={styles.input}
                    />
                  </div>
                </div>
                <div style={styles.routeRow}>
                  <div style={styles.fieldBlock}>
                    <label style={styles.fieldLabel}>Hora check-in</label>
                    <input
                      type="time"
                      value={accommodationDraft.checkin_time}
                      onChange={(e) => setAccommodationDraft((prev) => ({ ...prev, checkin_time: e.target.value }))}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.fieldBlock}>
                    <label style={styles.fieldLabel}>Hora check-out</label>
                    <input
                      type="time"
                      value={accommodationDraft.checkout_time}
                      onChange={(e) => setAccommodationDraft((prev) => ({ ...prev, checkout_time: e.target.value }))}
                      style={styles.input}
                    />
                  </div>
                </div>
                <div style={styles.fieldBlock}>
                  <label style={styles.fieldLabel}>Valor estimado</label>
                  <div style={styles.moneyInputWrapper}>
                    <span style={styles.moneyPrefix}>R$</span>
                    <input
                      type="number"
                      placeholder="0,00"
                      value={accommodationDraft.expected_value}
                      onChange={(e) => setAccommodationDraft((prev) => ({ ...prev, expected_value: e.target.value }))}
                      onFocus={(e) => e.target.select()}
                      style={styles.moneyInput}
                    />
                  </div>
                </div>
                <div style={styles.fieldBlock}>
                  <label style={styles.fieldLabel}>Valor real</label>
                  <div style={styles.moneyInputWrapper}>
                    <span style={styles.moneyPrefix}>R$</span>
                    <input
                      type="number"
                      placeholder="0,00"
                      value={accommodationDraft.real_value}
                      onChange={(e) => setAccommodationDraft((prev) => ({ ...prev, real_value: e.target.value }))}
                      onFocus={(e) => e.target.select()}
                      style={styles.moneyInput}
                    />
                  </div>
                </div>
                <div style={styles.fieldBlock}>
                  <label style={styles.fieldLabel}>Observacoes (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Check-in 14h"
                    value={accommodationDraft.notes}
                    onChange={(e) => setAccommodationDraft((prev) => ({ ...prev, notes: e.target.value }))}
                    style={styles.input}
                  />
                </div>
                <button type="submit" style={styles.primaryButton}>
                  <Plus size={18} /> {editingAccommodationId ? 'Salvar acomodacao' : 'Adicionar acomodacao'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {pickerState.open && (
        <div style={styles.pickerOverlay} onClick={closePicker}>
          <div style={styles.pickerModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.pickerHeader}>
              <h4 style={{ margin: 0 }}>
                {pickerState.type === 'accommodation'
                  ? 'Escolher acomodacao'
                  : pickerState.type === 'transport'
                    ? 'Escolher locomocao'
                    : pickerState.type === 'itineraryType'
                      ? 'Escolher tipo do roteiro'
                      : 'Escolher opcao'}
              </h4>
              <button type="button" onClick={closePicker} style={styles.closePickerBtn}>Fechar</button>
            </div>

            <div style={styles.pickerList}>
              {pickerState.type === 'accommodation' && accommodationOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setAccommodationDraft((prev) => ({ ...prev, accommodation_type: option }));
                    closePicker();
                  }}
                  style={{
                    ...styles.pickerOption,
                    ...(accommodationDraft.accommodation_type === option ? styles.pickerOptionActive : {})
                  }}
                >
                  {option}
                </button>
              ))}

              {pickerState.type === 'transport' && Object.entries(transportLabels).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setTripDraft((prev) => ({ ...prev, transport_type: value }));
                    closePicker();
                  }}
                  style={{
                    ...styles.pickerOption,
                    ...(tripDraft.transport_type === value ? styles.pickerOptionActive : {})
                  }}
                >
                  {label}
                </button>
              ))}

              {pickerState.type === 'itineraryType' && itineraryTypeOrder.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setItineraryDraft((prev) => ({ ...prev, item_type: option }));
                    closePicker();
                  }}
                  style={{
                    ...styles.pickerOption,
                    ...(itineraryDraft.item_type === option ? styles.pickerOptionActive : {})
                  }}
                >
                  <span style={{ marginRight: '8px' }}>{itineraryTypeIcons[option]}</span>
                  {itineraryTypeLabels[option]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryBox({ icon, label, value }) {
  return (
    <div style={styles.summaryBox}>
      <div style={styles.summaryIcon}>{icon}</div>
      <span style={styles.summaryLabel}>{label}</span>
      <strong style={styles.summaryValue}>{value}</strong>
    </div>
  );
}

const styles = {
  formColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '10px'
  },
  fieldBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  fieldBlockFull: {
    gridColumn: '1 / -1'
  },
  fieldLabel: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontWeight: '700'
  },
  chipField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  chipFieldLabel: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontWeight: '700'
  },
  selectTrigger: {
    border: '1px solid #bae6fd',
    borderRadius: '12px',
    padding: '11px 12px',
    background: 'white',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a'
  },
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  chipButton: {
    border: '1px solid #99f6e4',
    background: '#f0fdfa',
    color: '#115e59',
    borderRadius: '999px',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  chipButtonActive: {
    border: '1px solid #0f766e',
    background: '#0f766e',
    color: 'white',
    boxShadow: '0 6px 14px rgba(15, 118, 110, 0.25)'
  },
  input: {
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #a5f3fc',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    background: '#ecfeff'
  },
  moneyInputWrapper: {
    border: '1px solid #a5f3fc',
    borderRadius: '12px',
    background: '#ecfeff',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px'
  },
  moneyPrefix: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f766e',
    marginRight: '8px'
  },
  moneyInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    width: '100%',
    padding: '12px 0',
    fontSize: '14px',
    color: 'var(--text-main)'
  },
  primaryButton: {
    border: 'none',
    background: '#0f766e',
    color: 'white',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
    gap: '12px'
  },
  sectionToggleButton: {
    border: 'none',
    background: 'transparent',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    width: '100%',
    cursor: 'pointer',
    textAlign: 'left'
  },
  sectionTitle: {
    margin: 0,
    color: 'var(--text-main)',
    fontSize: '16px'
  },
  smallText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: '600'
  },
  successBanner: {
    padding: '10px 12px',
    borderRadius: '12px',
    background: '#ecfeff',
    color: '#0f766e',
    border: '1px solid #67e8f9',
    fontSize: '13px',
    fontWeight: '700'
  },
  emptyState: {
    textAlign: 'center',
    fontSize: '13px',
    color: 'var(--text-muted)',
    padding: '18px',
    background: 'rgba(0,0,0,0.02)',
    borderRadius: '12px',
    border: '1px dashed #67e8f9'
  },
  listColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  tripCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '14px',
    borderRadius: '14px',
    border: '1px solid #a5f3fc',
    background: 'white',
    alignItems: 'stretch'
  },
  tripCardTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'flex-start'
  },
  tripCardMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1
  },
  tripCardActive: {
    borderColor: '#0f766e',
    boxShadow: '0 8px 20px rgba(15, 118, 110, 0.12)'
  },
  tripSelectArea: {
    background: 'none',
    border: 'none',
    textAlign: 'left',
    padding: 0,
    flex: 1,
    cursor: 'pointer'
  },
  tripName: {
    display: 'block',
    fontSize: '15px',
    color: 'var(--text-main)'
  },
  tripMeta: {
    display: 'block',
    marginTop: '4px',
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  expandHint: {
    display: 'block',
    marginTop: '8px',
    fontSize: '12px',
    color: '#0f766e',
    fontWeight: '700'
  },
  cardActionRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  smallActionButton: {
    border: '1px solid #67e8f9',
    background: '#ecfeff',
    color: '#0f766e',
    borderRadius: '999px',
    padding: '6px 10px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  inlineActions: {
    display: 'flex',
    gap: '6px'
  },
  iconButton: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '5px'
  },
  secondaryTextButton: {
    background: 'none',
    border: 'none',
    color: '#0f766e',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '10px',
    marginBottom: '14px'
  },
  summaryBox: {
    borderRadius: '14px',
    padding: '14px',
    background: '#ecfeff',
    border: '1px solid #a5f3fc',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  summaryIcon: {
    color: '#0f766e'
  },
  summaryLabel: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: '600'
  },
  summaryValue: {
    fontSize: '16px',
    color: 'var(--text-main)'
  },
  comparisonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '10px'
  },
  comparisonCard: {
    borderRadius: '14px',
    padding: '14px',
    background: 'white',
    border: '1px solid #a5f3fc'
  },
  comparisonLabel: {
    display: 'block',
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginBottom: '4px'
  },
  comparisonValue: {
    fontSize: '18px',
    color: 'var(--text-main)'
  },
  comboGroupCard: {
    border: '1px solid #a5f3fc',
    borderRadius: '14px',
    background: 'linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%)',
    padding: '12px'
  },
  comboGroupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  comboGroupTitle: {
    color: '#0f766e',
    fontSize: '14px'
  },
  comboCard: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '14px',
    borderRadius: '14px',
    border: '1px solid #99f6e4',
    background: 'white',
    alignItems: 'flex-start'
  },
  comboValuesRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '6px',
    flexWrap: 'wrap'
  },
  groupCard: {
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    border: '1px solid #dbeafe',
    borderRadius: '14px',
    padding: '12px',
    boxShadow: '0 6px 16px rgba(15, 23, 42, 0.04)'
  },
  groupTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    gap: '10px'
  },
  groupTitle: {
    color: '#0f766e',
    fontSize: '13px',
    fontWeight: '800'
  },
  groupCount: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '700',
    background: '#eff6ff',
    border: '1px solid #dbeafe',
    borderRadius: '999px',
    padding: '4px 8px',
    whiteSpace: 'nowrap'
  },
  itemRowCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '12px',
    color: '#0f172a',
    padding: '10px 0',
    borderTop: '1px solid #eef2ff'
  },
  itemTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    width: '100%'
  },
  itemTopLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0
  },
  itemTopRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0
  },
  itemBottomRow: {
    width: '100%',
    paddingLeft: '36px'
  },
  itemMetaGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
    minWidth: 0
  },
  simpleDescriptionCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
    flex: 1
  },
  accommodationInfoBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: 0,
    flex: 1
  },
  accommodationMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    minWidth: 0
  },
  accommodationPrimaryMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0
  },
  secondaryTypePill: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '999px',
    padding: '2px 7px',
    fontSize: '10px',
    fontWeight: '700',
    whiteSpace: 'nowrap'
  },
  secondaryTypeIcon: {
    marginRight: '5px',
    fontSize: '12px',
    lineHeight: 1
  },
  descriptionText: {
    display: 'block',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    whiteSpace: 'normal',
    lineHeight: '1.35',
    fontWeight: '400',
    fontSize: '13px',
    color: '#0f172a'
  },
  descriptionTextAccommodation: {
    display: 'block',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    whiteSpace: 'normal',
    lineHeight: '1.35',
    fontWeight: '600',
    color: '#0f172a'
  },
  simpleValueCell: {
    flexShrink: 0,
    whiteSpace: 'nowrap',
    fontWeight: '700',
    color: '#0f766e'
  },
  simpleActionCell: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '2px',
    alignItems: 'center',
    flexShrink: 0
  },
  timePill: {
    display: 'inline-flex',
    alignItems: 'center',
    alignSelf: 'flex-start',
    background: '#ecfeff',
    color: '#155e75',
    border: '1px solid #bae6fd',
    borderRadius: '999px',
    padding: '3px 8px',
    fontSize: '11px',
    fontWeight: '700',
    whiteSpace: 'nowrap'
  },
  checkButton: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
    width: '28px',
    height: '28px',
    borderRadius: '8px'
  },
  rowCompleted: {
    textDecoration: 'line-through',
    color: '#64748b'
  },
  detailsDivider: {
    margin: '8px 0',
    borderTop: '1px solid #cbd5e1'
  },
  tripDetailsPanel: {
    borderTop: '1px solid #ccfbf1',
    paddingTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  tripDetailsBlock: {
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '12px'
  },
  tripDetailsTitle: {
    margin: 0,
    color: 'var(--text-main)',
    fontSize: '14px'
  },
  pickerOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.38)',
    zIndex: 1200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  pickerModal: {
    width: '100%',
    maxWidth: '420px',
    background: 'white',
    borderRadius: '16px',
    border: '1px solid #bae6fd',
    boxShadow: '0 24px 40px rgba(2, 132, 199, 0.2)',
    padding: '14px'
  },
  pickerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  closePickerBtn: {
    border: 'none',
    background: 'none',
    color: '#0f766e',
    cursor: 'pointer',
    fontWeight: '700'
  },
  pickerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '320px',
    overflowY: 'auto'
  },
  pickerOption: {
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '11px 12px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#0f172a'
  },
  pickerOptionActive: {
    border: '1px solid #0f766e',
    background: '#ecfeff',
    color: '#0f766e'
  },
  expectedPill: {
    fontSize: '11px',
    borderRadius: '999px',
    padding: '4px 8px',
    border: '1px solid #bae6fd',
    background: '#f0f9ff',
    color: '#0369a1',
    fontWeight: '700'
  },
  realPill: {
    fontSize: '11px',
    borderRadius: '999px',
    padding: '4px 8px',
    border: '1px solid #99f6e4',
    background: '#f0fdfa',
    color: '#0f766e',
    fontWeight: '700'
  },
  routeSection: {
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '14px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  routeSectionTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '700',
    color: '#0369a1'
  },
  routeToggleButton: {
    border: '1px solid #7dd3fc',
    background: 'white',
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#0c4a6e',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px'
  },
  routeRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '10px'
  },
  mapsLink: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0369a1',
    textDecoration: 'none',
    padding: '10px 14px',
    border: '1px solid #bae6fd',
    borderRadius: '10px',
    background: 'white',
    whiteSpace: 'nowrap',
    cursor: 'pointer'
  },
  suggestionList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 500,
    background: 'white',
    border: '1px solid #bae6fd',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(2, 132, 199, 0.15)',
    marginTop: '4px',
    overflow: 'hidden'
  },
  suggestionItem: {
    display: 'block',
    width: '100%',
    padding: '10px 14px',
    background: 'none',
    border: 'none',
    borderBottom: '1px solid #f0f9ff',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#0f172a',
    lineHeight: '1.4'
  }
};
