'use client';

import React, { useState } from 'react';
import { PhoneIcon, HomeIcon, BriefcaseIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/solid';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const localProfessions = [
  'Plumber', 'Electrician', 'Carpenter', 'Painter',
  'AC Technician', 'Mechanic', 'House Cleaner', 'Gardener',
  'Cook', 'Driver', 'Washer', 'Welder'
];

const initialSchedule = {
  Monday: { start: '', end: '' },
  Tuesday: { start: '', end: '' },
  Wednesday: { start: '', end: '' },
  Thursday: { start: '', end: '' },
  Friday: { start: '', end: '' },
  Saturday: { start: '', end: '' },
  Sunday: { start: '', end: '' },
};

const states = ['Kerala', 'Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Gujarat'];

const cities: Record<string, string[]> = {
  Kerala: ['Kochi', 'Calicut', 'Malappuram', 'Kannur', 'Trissur', 'Kollam', 'Trivandrum', 'Pathanamthitta', 'Idukki', 'Wayanad'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru'],
  Delhi: ['New Delhi', 'Dwarka'],
  'Tamil Nadu': ['Chennai', 'Coimbatore'],
  Gujarat: ['Ahmedabad', 'Surat']
};

export default function WorkerProfileForm() {
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [radius, setRadius] = useState('');
  const [profession, setProfession] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState('');
  const [address, setAddress] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [schedule, setSchedule] = useState(initialSchedule);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  const handleScheduleChange = (
    day: keyof typeof initialSchedule,
    timeType: 'start' | 'end',
    value: string
  ) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [timeType]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert("You must agree to the terms and privacy policy.");
      return;
    }
    const formData = new FormData();
    formData.append('profession', profession);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('zip', zip);
    formData.append('address', address);
    formData.append('state', selectedState);
    formData.append('city', selectedCity);
    formData.append('radius', radius);
    formData.append('additionalInfo', additionalInfo);
    if (profilePic) {
      formData.append('profilePic', profilePic);
    }
    console.log('Form submitted!');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto py-10 px-4 sm:px-6 md:px-8 bg-gray-50 mt-12">
      <div className="flex flex-col items-center text-center mb-8 mt-6">
        <div className="relative w-40 h-40 mb-4">
          {previewURL ? (
            <img
            src={previewURL}
              alt="Profile Preview"
              className="w-40 h-40 rounded-full object-cover border border-gray-300 shadow-md"
            />
          ) : (
            <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300 shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 text-gray-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}

          <label htmlFor="profilePic" className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-blue-700 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828M16 3h5v5M21 21H3V3h6" />
            </svg>
          </label>
          <input id="profilePic" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
        </div>

        <label htmlFor="profilePic" className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium cursor-pointer hover:bg-blue-700 transition inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h4l2-3h6l2 3h4a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 11a3 3 0 100 6 3 3 0 000-6z" />
          </svg>
          Upload Profile Photo
        </label>
        <p className="text-gray-500 text-sm mt-2">Professional photo recommended</p>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">Complete Your Worker Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="phone" className="font-medium mb-1 flex items-center gap-2">
            <PhoneIcon className="h-5 w-5 text-blue-600" /> Phone Number
          </label>
          <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label htmlFor="zip" className=" font-medium mb-1 flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-blue-600" /> Zip Code
          </label>
          <input type="text" id="zip" value={zip} onChange={(e) => setZip(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="address" className=" font-medium mb-1 flex items-center gap-2">
            <HomeIcon className="h-5 w-5 text-blue-600" /> Street Address
          </label>
          <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="profession" className=" font-medium mb-1 flex items-center gap-2">
            <BriefcaseIcon className="h-5 w-5 text-blue-600" /> Profession
          </label>
          <select id="profession" value={profession} onChange={(e) => setProfession(e.target.value)} className="w-full p-2 border rounded" required>
            <option value="">Select a Profession</option>
            {localProfessions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ClockIcon className="h-6 w-6 text-blue-600 bg-blue-100 p-1 rounded-full" /> Work Schedule
        </h2>
     <div className="grid grid-cols-1 gap-4">
  {weekdays.map((day) => (
    <div
      key={day}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 border-b pb-2"
    >
      <label className="text-sm font-medium w-28 shrink-0">{day}</label>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full">
        <input
          type="time"
          value={schedule[day as keyof typeof schedule].start}
          onChange={(e) =>
            handleScheduleChange(day as keyof typeof schedule, 'start', e.target.value)
          }
          className="border px-3 py-2 rounded w-full sm:w-40"
        />
        <span className="text-center text-sm text-gray-500">to</span>
        <input
          type="time"
          value={schedule[day as keyof typeof schedule].end}
          onChange={(e) =>
            handleScheduleChange(day as keyof typeof schedule, 'end', e.target.value)
          }
          className="border px-3 py-2 rounded w-full sm:w-40"
        />
      </div>
    </div>
  ))}
</div>


      </div>

      <div className="mb-6">
        <label className="block font-medium mb-1">Additional Info or Skills</label>
        <textarea rows={3} value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} className="w-full p-2 border rounded" placeholder="E.g., I also fix water motors or install RO systems" />
      </div>

      <div className="mb-6">
        <label className="flex items-start space-x-2">
          <input type="checkbox" className="mt-1" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
          <span>
            I agree to the <a href="#" className="text-blue-600 underline">Terms and Conditions</a> and <a href="#" className="text-blue-600 underline">Privacy Policy</a>
          </span>
        </label>
      </div>

      <div className="flex justify-center">
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Submit Profile</button>
      </div>
    </form>
  );
}
