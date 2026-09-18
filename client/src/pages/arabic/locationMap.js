import { useState, useEffect } from "react";

export default function LocationMap({ onLocationSelect, initialLocation = '' }) {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [subLocation, setSubLocation] = useState('');

  const jordanRegions = {
    amman: { name: 'عمان' },
    zarqa: { name: 'الزرقاء' },
    irbid: { name: 'إربد' },
    salt: { name: 'السلط' },
    madaba: { name: 'مادبا' },
    jerash: { name: 'جرش' },
    ajloun: { name: 'عجلون' },
    karak: { name: 'الكرك' },
    tafilah: { name: 'الطفيلة' },
    maan: { name: 'معان' },
    aqaba: { name: 'العقبة' },
    mafraq: { name: 'المفرق' }
  };

  useEffect(() => {
    if (initialLocation) {
      const [regionName, subLoc = ''] = initialLocation.split(" - ");
      const regionId = Object.keys(jordanRegions).find(
        key => jordanRegions[key].name === regionName
      );
      if (regionId) {
        setSelectedRegion(regionId);
        setSubLocation(subLoc);
      }
    }
  }, [initialLocation]);

  useEffect(() => {
    if (selectedRegion === '') {
      onLocationSelect('');
    } else if (subLocation) {
      onLocationSelect(`${jordanRegions[selectedRegion].name} - ${subLocation}`);
    } else {
      onLocationSelect(jordanRegions[selectedRegion].name);
    }
  }, [selectedRegion, subLocation, onLocationSelect, jordanRegions]);

  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
    setSubLocation('');
  };

  const handleSubLocationChange = (e) => {
    setSubLocation(e.target.value);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
          اختر المنطقة
        </label>
        <select
          id="region"
          aria-label="اختر المنطقة"
          className="block w-full mt-1 border rounded-md py-2 px-3 shadow-sm focus:border-green-500 focus:ring-green-500"
          onChange={handleRegionChange}
          value={selectedRegion}
        >
          <option value="" disabled>-- اختر المنطقة --</option>
          {Object.entries(jordanRegions).map(([id, region]) => (
            <option key={id} value={id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {selectedRegion && (
        <div>
          <label htmlFor="sub-location" className="block text-sm font-medium text-gray-700 mb-1">
            المنطقة المحددة
          </label>
          <input
            id="sub-location"
            type="text"
            aria-label="المنطقة المحددة"
            className="block w-full border rounded-md py-2 px-3 shadow-sm focus:border-green-500 focus:ring-green-500"
            placeholder="مثلاً: طلة العلي"
            value={subLocation}
            onChange={handleSubLocationChange}
          />
        </div>
      )}
    </div>
  );
}
