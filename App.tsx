import React, { useState, useEffect } from 'react';
import { ProjectList } from './components/ProjectList';
import { TripEditor } from './components/TripEditor';
import { AIAssistant } from './components/AIAssistant';
import { SettingsModal } from './components/SettingsModal';
import { getProjects, saveProjects, saveTripData, getTripData, deleteProject } from './services/storageService';
import { TripProject, FullTripData, AppView, HouseTheme } from './types';
import { HOUSE_THEMES, DEFAULT_MEMBERS } from './constants';
import { Settings } from 'lucide-react';
import { initGoogleApi } from './services/googleService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [projects, setProjects] = useState<TripProject[]>([]);
  const [activeTrip, setActiveTrip] = useState<FullTripData | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<HouseTheme>(HOUSE_THEMES.gryffindor);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setProjects(getProjects());
    const storedId = localStorage.getItem('tripPlanner_client_id');
    if (storedId) {
        initGoogleApi(storedId).then(() => {
        }).catch(e => console.log("Google API init deferred"));
    }
  }, []);

  const handleLogin = async () => {
      const storedId = localStorage.getItem('tripPlanner_client_id');
      if (!storedId) {
          alert("請先在設定中輸入 Google Client ID");
          setShowSettings(true);
          return;
      }
      try {
        await initGoogleApi(storedId);
        setIsLoggedIn(true);
      } catch (e) {
        alert("登入魔法部失敗");
      }
  };

  const handleCreateNew = () => {
    const id = Math.random().toString(36).substring(2, 9);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 4); 

    const newTrip: FullTripData = {
      id,
      themeId: 'gryffindor',
      tripSettings: {
          title: `魔法之旅 ${Math.floor(Math.random() * 100)}`,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          days: 5,
          destination: '霍格華茲'
      },
      currencySettings: {
          selectedCountry: { code: 'JP', currency: 'JPY', name: 'Japan' },
          exchangeRate: 0.21
      },
      companions: JSON.parse(JSON.stringify(DEFAULT_MEMBERS)),
      categories: { itinerary: [], expense: [] },
      itinerary: Array.from({length: 5}).map((_, i) => ({
          id: `day-${i}`,
          dayNumber: i+1,
          date: new Date(startDate.getTime() + i*86400000).toISOString().split('T')[0],
          activities: []
      })),
      expenses: [],
      packingList: [{ id: '1', text: '護照', completed: false }],
      shoppingList: [],
      foodList: [],
      sightseeingList: [],
      lastModified: Date.now(),
    };
    saveTripData(newTrip);
    setProjects(getProjects());
    handleSelectProject(id);
  };

  const handleTripGenerated = (trip: FullTripData) => {
    saveTripData(trip);
    setProjects(getProjects());
    setShowAIAssistant(false);
    handleSelectProject(trip.id);
  };

  const handleSelectProject = (id: string) => {
    const trip = getTripData(id);
    if (trip) {
      // Ensure backwards compatibility / default values for migration would go here
      // For now assuming clean state or valid data
      setActiveTrip(trip);
      setView(AppView.TRIP_DETAIL);
    }
  };

  const handleUpdateTrip = (updatedTrip: FullTripData) => {
      setActiveTrip(updatedTrip);
  };

  const handleDeleteProject = (id: string) => {
      if(window.confirm("確定要施展「去去武器走」永久刪除此卷軸嗎？\n(若已連結雲端，檔案也將一併消失)")) {
          deleteProject(id);
          setProjects(getProjects());
      }
  };

  const handleThemeChange = (themeId: string) => {
    if (HOUSE_THEMES[themeId]) {
      setCurrentTheme(HOUSE_THEMES[themeId]);
    }
  };

  return (
    <>
      {view === AppView.DASHBOARD && (
        <>
          <nav className={`absolute top-4 right-4 z-[60]`}>
             <button 
               onClick={() => setShowSettings(true)}
               className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
               title="麻瓜設定"
             >
                <Settings className="w-6 h-6" />
             </button>
          </nav>
          
          <ProjectList 
            projects={projects}
            currentTheme={currentTheme}
            onSelect={handleSelectProject}
            onDelete={handleDeleteProject}
            onCreateNew={handleCreateNew}
            onThemeChange={handleThemeChange}
            isLoggedIn={isLoggedIn}
            onLogin={handleLogin}
            onLogout={() => setIsLoggedIn(false)}
          />
        </>
      )}

      {view === AppView.TRIP_DETAIL && activeTrip && (
        <TripEditor 
          trip={activeTrip}
          theme={currentTheme}
          onBack={() => {
              setView(AppView.DASHBOARD);
              setProjects(getProjects());
          }}
          onUpdate={handleUpdateTrip}
        />
      )}

      {showAIAssistant && (
        <AIAssistant 
          onTripGenerated={handleTripGenerated}
          onClose={() => setShowAIAssistant(false)}
        />
      )}

      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        theme={currentTheme}
      />
    </>
  );
};

export default App;