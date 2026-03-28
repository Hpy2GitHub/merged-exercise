// src/hooks/useExercises.ts
// MODIFIED: added API load/save via exerciseApi service.
// Load order:  API  →  localStorage  →  defaults
// Save:        localStorage (sync) + API (async background, silent on failure)

// TODO: where to put the new guard for local storage?

import { useState, useEffect } from 'react';
import { Exercise, ExerciseList, ExportData } from '../types';
import { DEFAULT_DATA, isUsingDefaultData } from '../data/defaultExercises';
import { apiLoad, apiSave } from '../services/exerciseApi';
import { features } from "../config/features";

type ViewMode = 'cards' | 'detail' | 'table' | 'lists' | 'listDetail';

export const useExercises = () => {
  const defaultExercise: Exercise = {
    name: '',
    key: '',
    thumbnailLink: '',
    videoLink: '',
    hasVideo: false,
    description: '',
    primaryMuscle: '',
    musclesTargeted: [],
    equipment: [],
    difficulty: 'Beginner',
    instructions: [''],
    commonMistakes: [''],
    tips: [''],
    calculator: {
      beginner: { reps: '', lbs: '', oneRepMax: '' },
      intermediate: { reps: '', lbs: '', oneRepMax: '' },
      advanced: { reps: '', lbs: '', oneRepMax: '' }
    },
  };

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [lists, setLists] = useState<ExerciseList[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number | null>(null);
  const [selectedListIndex, setSelectedListIndex] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isListFormOpen, setIsListFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingListIndex, setEditingListIndex] = useState<number | null>(null);
  const [launchTime, setLaunchTime] = useState('');
  const [keyWarning, setKeyWarning] = useState('');
  const [currentExercise, setCurrentExercise] = useState<Exercise>(defaultExercise);
  const [currentList, setCurrentList] = useState<ExerciseList>({
    name: '',
    description: '',
    exercises: [],
    createdDate: '',
    tags: []
  });
  const [isUsingDefaults, setIsUsingDefaults] = useState(false);

  // ─── save ──────────────────────────────────────────────────────────────────

  /**
   * Persist data synchronously to localStorage AND fire-and-forget to the API.
   * If the API call fails it logs a warning but never blocks the UI.
   */
  const saveData = (exercisesData: Exercise[], listsData: ExerciseList[]): void => {
    // 1. localStorage — always, synchronous
    try {
      const data: ExportData = { exercises: exercisesData, lists: listsData };
      localStorage.setItem('exercises-data', JSON.stringify(data));
      console.log('💾 Saved to localStorage');
    } catch (error) {
      console.error('localStorage save failed:', error);
      alert('Failed to save data locally. Your changes may not persist.');
    }

    // 2. API — async, background, non-blocking
    apiSave(exercisesData, listsData)
      .then(() => console.log('☁️  Saved to API'))
      .catch(err => console.warn('⚠️  API save failed (data still in localStorage):', err));
  };

  // Keep the old name as an alias so nothing else in the file needs to change.
  const saveToLocalStorage = saveData;

  // ─── validation ────────────────────────────────────────────────────────────

  const validateAndParseData = (rawData: any): { exercises: Exercise[], lists: ExerciseList[] } => {
    try {
      if (!rawData || typeof rawData !== 'object') {
        console.warn('Invalid data structure, returning empty arrays');
        return { exercises: [], lists: [] };
      }

      const exercises = Array.isArray(rawData.exercises) ? rawData.exercises : [];
      const lists = Array.isArray(rawData.lists) ? rawData.lists : [];

      const validatedExercises = exercises.filter((ex: any) => {
        return ex && typeof ex === 'object' && ex.name && ex.key;
      }).map((ex: any) => {
        //  TRACE: field name check — does the API use snake_case?
        //console.group(`[validateAndParseData] "${ex.name ?? ex.key}"`);
        //console.log('  Raw object keys:', Object.keys(ex));
        //console.log('  ex.primaryMuscle (camelCase):', ex.primaryMuscle);
        //console.log('  ex.primary_muscle (snake_case):', ex.primary_muscle);
        //console.groupEnd();
        // TRACE END
        return {
          ...defaultExercise,
          ...ex,
          musclesTargeted: Array.isArray(ex.musclesTargeted) ? ex.musclesTargeted : [],
          equipment: Array.isArray(ex.equipment) ? ex.equipment : [],
          instructions: Array.isArray(ex.instructions) ? ex.instructions : [''],
          commonMistakes: Array.isArray(ex.commonMistakes) ? ex.commonMistakes : [''],
          tips: Array.isArray(ex.tips) ? ex.tips : [''],
          calculator: ex.calculator || defaultExercise.calculator,
          difficulty: ex.difficulty || defaultExercise.difficulty,
          // Explicitly preserve primaryMuscle to ensure it's not lost
          primaryMuscle: ex.primaryMuscle || '',
        };
      });


//---
// In validateAndParseData, after mapping exercises, add:
console.log('=== DEBUG: Toe exercises primaryMuscle ===');
validatedExercises.forEach(ex => {
  if (ex.name.toLowerCase().includes('toe')) {
    console.log(`  ${ex.name}: primaryMuscle = "${ex.primaryMuscle}"`);
  }
});
//---

      const validatedLists = lists.filter((list: any) => {
        return list && typeof list === 'object' && list.name;
      }).map((list: any) => ({
        name: list.name || '',
        description: list.description || '',
        exercises: Array.isArray(list.exercises) ? list.exercises : [],
        createdDate: list.createdDate || new Date().toISOString(),
        tags: Array.isArray(list.tags) ? list.tags : [],
      }));

      // Debug log to verify primaryMuscle is preserved
      console.log('Validated exercises with primary muscle:');
      validatedExercises.forEach(ex => {
        if (ex.primaryMuscle) {
          console.log(`  - ${ex.name}: primaryMuscle = "${ex.primaryMuscle}"`);
        }
      });

      return { exercises: validatedExercises, lists: validatedLists };
    } catch (error) {
      console.error('Data validation failed:', error);
      return { exercises: [], lists: [] };
    }
  };

  // ─── load ──────────────────────────────────────────────────────────────────

  /**
   * Load order:
   *   1. API   — the server is the source of truth
   *   2. browserStorage — offline / API-down fallback
   *   3. localStorage - bundled json in project
   *   4. DEFAULT_DATA — first ever launch fallback
   */
const loadInitialData = async (): Promise<void> => {

    // 1. Try the API first
    if (features.canUseApi) {
      try {
        console.log('🌐 Loading from API…');
        const apiData = await apiLoad();
        const { exercises: validatedExercises, lists: validatedLists } = validateAndParseData(apiData);
  
        if (validatedExercises.length > 0) {
          setExercises(validatedExercises);
          setLists(validatedLists);
          setIsUsingDefaults(isUsingDefaultData(validatedExercises));
          localStorage.setItem('exercises-data', JSON.stringify(apiData));
          console.log('✅ Loaded from API');
          return;
        } 
        console.log('API returned empty data — falling through');
      } catch (err) {
        console.warn('⚠️  API load failed:', err);
      }
    }

    // 2. Try browserStorage (window.localStorage) — disabled on GitHub to avoid
    //    stale data confusion during development and testing
    if (features.canUseBrowserData) {
      try {
        const saved = localStorage.getItem('exercises-data');
        if (saved) {
          const rawData = JSON.parse(saved);
          const { exercises: validatedExercises, lists: validatedLists } = validateAndParseData(rawData);

          if (validatedExercises.length > 0) {
            setExercises(validatedExercises);
            setLists(validatedLists);
            setIsUsingDefaults(isUsingDefaultData(validatedExercises));
            console.log('✅ Loaded from browserStorage');
            return;
          }
        }
      } catch (err) {
        console.warn('⚠️ browserStorage load failed:', err);
      }
    }

    // 3. Try static exercises.json bundled in the repo (public/exercises.json)
    //    This is the main data source for GitHub Pages — no server required.
    //    Gated on canUseLocalData (nothing to do with browserStorage).
    if (features.canUseLocalData) {
      try {
        const url = `${import.meta.env.BASE_URL}exercises.json`;
        console.log('📂 Loading from bundled JSON…', url);
        const response = await fetch(url);
        if (response.ok) {
          const rawData = await response.json();
          const { exercises: validatedExercises, lists: validatedLists } = validateAndParseData(rawData);

          if (validatedExercises.length > 0) {
            setExercises(validatedExercises);
            setLists(validatedLists);
            setIsUsingDefaults(isUsingDefaultData(validatedExercises));
            console.log('✅ Loaded from bundled exercises.json');
            return;
          }
        }
      } catch (err) {
        console.warn('⚠️ Bundled JSON load failed:', err);
      }
    }

    // 4. Last resort — hardcoded sample exercises
    console.log('📦 Loading default exercise data…');
    setExercises(DEFAULT_DATA.exercises);
    setLists(DEFAULT_DATA.lists);
    setIsUsingDefaults(true);
    saveData(DEFAULT_DATA.exercises, DEFAULT_DATA.lists);
    console.log('✅ Default data loaded and saved');
  };

  // ─── reset ─────────────────────────────────────────────────────────────────

  const resetToDefaults = (): void => {
    const confirmed = window.confirm(
      'Reset to default exercises?\n\n' +
      'This will replace all current data with the default sample exercises and lists. ' +
      'Consider exporting your current data first.\n\n' +
      'Continue?'
    );

    if (confirmed) {
      setExercises(DEFAULT_DATA.exercises);
      setLists(DEFAULT_DATA.lists);
      setIsUsingDefaults(true);
      saveData(DEFAULT_DATA.exercises, DEFAULT_DATA.lists);
      alert('✅ Reset to default data complete!');
    }
  };

  // ─── init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const formatted = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    setLaunchTime(formatted);
    loadInitialData();
  }, []);

  // ─── everything below is UNCHANGED from the original ──────────────────────

  const generateKey = (name: string): string => name.toLowerCase().replace(/\s+/g, '-');

  const resetForm = (): void => {
    setCurrentExercise(defaultExercise);
    setEditingIndex(null);
    setKeyWarning('');
  };

  const resetListForm = (): void => {
    setCurrentList({
      name: '',
      description: '',
      exercises: [],
      createdDate: new Date().toISOString(),
      tags: []
    });
    setEditingListIndex(null);
  };

  const handleNameChange = (value: string): void => {
    const generatedKey = generateKey(value);
    setCurrentExercise(prev => ({
      ...prev,
      name: value,
      key: generatedKey,
      thumbnailLink: `${generatedKey}.jpg`,
      videoLink: `/videos/${generatedKey}.mp4`
    }));
  
    // Warn immediately if name already exists (case-insensitive, skip self when editing)
    const isDuplicate = exercises.some(
      (ex, i) =>
        ex.name.trim().toLowerCase() === value.trim().toLowerCase() &&
        i !== editingIndex
    );
    setKeyWarning(isDuplicate ? `An exercise named "${value}" already exists.` : '');
  };

  const handleNameBlur = (): void => {
    const duplicate = exercises.findIndex(ex => ex.key === currentExercise.key);
    if (duplicate !== -1 && duplicate !== editingIndex && currentExercise.key) {
      setKeyWarning(`Warning: Key "${currentExercise.key}" already exists!`);
    } else {
      setKeyWarning('');
    }
  };

  const handleBooleanChange = (field: 'hasVideo', value: boolean): void => {
    setCurrentExercise(prev => ({ ...prev, [field]: value }));
  };

  const handleStringChange = (field: 'primaryMuscle' | 'difficulty' | 'description' | 'name' | 'key' | 'thumbnailLink' | 'videoLink', value: string): void => {
    setCurrentExercise(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: 'musclesTargeted' | 'equipment', value: string): void => {
    setCurrentExercise(prev => {
      const currentArray = prev[field];
      if (!Array.isArray(currentArray)) return prev;
      return {
        ...prev,
        [field]: currentArray.includes(value)
          ? currentArray.filter(v => v !== value)
          : [...currentArray, value]
      };
    });
  };

  const handleCheckboxChange = (field: keyof Exercise, value: string): void => {
    if (field === 'hasVideo') { handleBooleanChange('hasVideo', value === 'true'); return; }
    if (field === 'primaryMuscle' || field === 'difficulty') { handleStringChange(field, value); return; }
    if (field === 'musclesTargeted' || field === 'equipment') { handleArrayToggle(field, value); return; }
    if (typeof currentExercise[field] === 'string') {
      setCurrentExercise(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayChange = (field: keyof Exercise, index: number, value: string): void => {
    setCurrentExercise(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: keyof Exercise): void => {
    setCurrentExercise(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  const removeArrayItem = (field: keyof Exercise, index: number): void => {
    setCurrentExercise(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleCalculatorChange = (
    level: 'beginner' | 'intermediate' | 'advanced',
    field: 'reps' | 'lbs' | 'oneRepMax',
    value: string
  ): void => {
    setCurrentExercise(prev => ({
      ...prev,
      calculator: { ...prev.calculator, [level]: { ...prev.calculator[level], [field]: value } }
    }));
  };

  const handleSubmit = (): void => {
    if (!currentExercise.name || !currentExercise.key) { alert('Name is required'); return; }

    let updatedExercises: Exercise[];
    if (editingIndex !== null) {
      updatedExercises = exercises.map((ex, i) => i === editingIndex ? currentExercise : ex);
    } else {
      updatedExercises = [...exercises, currentExercise];
    }

    setExercises(updatedExercises);
    saveToLocalStorage(updatedExercises, lists);
    setIsUsingDefaults(isUsingDefaultData(updatedExercises));
    setIsFormOpen(false);
    resetForm();
  };

  const handleEdit = (index: number): void => {
    setCurrentExercise({ ...exercises[index] });
    setEditingIndex(index);
    setIsFormOpen(true);
  };

  const handleDelete = (index: number): void => {
    if (window.confirm('Delete this exercise?')) {
      const updatedExercises = exercises.filter((_, i) => i !== index);
      setExercises(updatedExercises);
      saveToLocalStorage(updatedExercises, lists);
      setIsUsingDefaults(isUsingDefaultData(updatedExercises));
    }
  };

  const handleExport = (): void => {
    const data: ExportData = { exercises, lists };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    a.download = `exercises_backup_${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('Backup file downloaded! Use this to transfer data to another machine.');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onerror = () => alert(`Could not read file: ${reader.error?.message ?? 'Unknown error'}`);
    reader.onload = (ev) => {
      try {
        const result = ev.target?.result;
        if (!result || typeof result !== 'string') { alert('File is empty or could not be read'); return; }

        const rawData = JSON.parse(result);
        const { exercises: importedExercises, lists: importedLists } = validateAndParseData(rawData);

        if (importedExercises.length > 0 || importedLists.length > 0) {
          setExercises(importedExercises);
          setLists(importedLists);
          setIsUsingDefaults(isUsingDefaultData(importedExercises));
          saveToLocalStorage(importedExercises, importedLists);
          alert(`Import successful! Loaded ${importedExercises.length} exercises and ${importedLists.length} lists.`);
        } else {
          alert('Import failed: No valid data found in the file.');
        }
      } catch (err) {
        if (err instanceof SyntaxError) {
          alert(`JSON parsing error: ${err.message}`);
        } else {
          alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleViewDetails = (index: number): void => {
    console.log('useExercise handleViewDetails', index);
  
    // Guard clause: Optional, but good if you don't trust the source of 'index'
    if (index === undefined || index === null) {
      console.warn("Attempted to view details with an invalid index.");
      return;
    }

    setSelectedExerciseIndex(index);
    setViewMode('detail');
  };

  const openAddForm = (): void => { resetForm(); setIsFormOpen(true); };

  const handleListCreate = (): void => { resetListForm(); setIsListFormOpen(true); };

  const handleListUpdate = (index: number): void => {
    setCurrentList({ ...lists[index] });
    setEditingListIndex(index);
    setIsListFormOpen(true);
  };

  const handleListDelete = (index: number): void => {
    if (window.confirm('Delete this list?')) {
      const updatedLists = lists.filter((_, i) => i !== index);
      setLists(updatedLists);
      saveToLocalStorage(exercises, updatedLists);
    }
  };

  const handleListView = (index: number): void => {
    setSelectedListIndex(index);
    setViewMode('listDetail');
  };

  const handleListSubmit = (): void => {
    if (!currentList.name) { alert('List name required'); return; }

    let updatedLists: ExerciseList[];
    if (editingListIndex !== null) {
      updatedLists = lists.map((l, i) => i === editingListIndex ? currentList : l);
    } else {
      updatedLists = [...lists, { ...currentList, createdDate: new Date().toISOString() }];
    }

    setLists(updatedLists);
    saveToLocalStorage(exercises, updatedLists);
    setIsListFormOpen(false);
    resetListForm();
  };

  const toggleExerciseInList = (exerciseKey: string): void => {
    setCurrentList(prev => ({
      ...prev,
      exercises: prev.exercises.includes(exerciseKey)
        ? prev.exercises.filter(k => k !== exerciseKey)
        : [...prev.exercises, exerciseKey]
    }));
  };

  const handleToggleExerciseInList = (listIndex: number, exerciseKey: string): void => {
    const updatedLists = lists.map((list, idx) => {
      if (idx !== listIndex) return list;
      return {
        ...list,
        exercises: list.exercises.includes(exerciseKey)
          ? list.exercises.filter(k => k !== exerciseKey)
          : [...list.exercises, exerciseKey]
      };
    });
    setLists(updatedLists);
    saveToLocalStorage(exercises, updatedLists);
  };

  return {
    exercises,
    lists,
    viewMode,
    setViewMode,
    selectedExerciseIndex,
    selectedListIndex,
    isFormOpen,
    setIsFormOpen,
    isListFormOpen,
    setIsListFormOpen,
    currentExercise,
    currentList,
    setCurrentList,
    editingIndex,
    keyWarning,
    launchTime,
    isUsingDefaults,
    resetToDefaults,
    handleViewDetails,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleExport,
    handleImport,
    openAddForm,
    handleNameChange,
    handleNameBlur,
    handleCheckboxChange,
    handleBooleanChange,
    handleStringChange,
    handleArrayToggle,
    handleArrayChange,
    addArrayItem,
    removeArrayItem,
    handleCalculatorChange,
    handleListCreate,
    handleListUpdate,
    handleListDelete,
    handleListView,
    handleListSubmit,
    toggleExerciseInList,
    handleToggleExerciseInList,
  };
};
