/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import VehicleList from '@/components/VehicleList';
import SearchBar from '@/components/SearchBar';
import StatusAlert from '@/components/StatusAlert';
import { Vehicle, Status } from '@/types/vehicles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderOpen, Crosshair, Play } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Home() {
  const [gamePath, setGamePath] = useState<string>('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<Status>({ message: '', type: 'info' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSavedDirectory();
    loadVehicles();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [searchQuery, vehicles]);

  const loadSavedDirectory = async () => {
    try {
      const savedDirectory = await invoke<string | null>('load_directory_from_file');
      if (savedDirectory) {
        setGamePath(savedDirectory);
      }
    } catch (error) {
      console.error('Error loading saved directory:', error);
      setStatus({
        message: 'Failed to load saved directory',
        type: 'error'
      });
    }
  };

  async function saveDirectory(path: string) {
    try {
      await invoke('save_directory_to_file', { path });
      console.log('Directory path saved successfully.');
    } catch (error) {
      console.error('Error saving directory path:', error);
      throw error;
    }
  }

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      console.log('Loading vehicles from backend...');
      const vehicleDataJson = await invoke<string>('fetch_vehicles');
      const vehicleData = JSON.parse(vehicleDataJson);
      setVehicles(vehicleData);
      console.log('Vehicles loaded successfully');
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setStatus({
        message: `Failed to load vehicles data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterVehicles = useCallback(() => {
    const filtered = vehicles.filter(vehicle => {
      const search = searchQuery.toLowerCase();
      return vehicle.name.toLowerCase().includes(search) ||
             vehicle.vehicle_id.toLowerCase().includes(search);
    });
    setFilteredVehicles(filtered);
  }, [searchQuery, vehicles]);
  
  useEffect(() => {
    filterVehicles();
  }, [filterVehicles]);

  const handleBrowse = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });
      
      if (selected) {
        const path = selected as string;
        await saveDirectory(path);
        setGamePath(path);
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
      setStatus({
        message: 'Failed to save selected directory',
        type: 'error'
      });
    }
  };

  const handleSetupTestDrive = async () => {
    if (!gamePath || !selectedVehicle) {
      setStatus({
        message: 'Please select game path and vehicle',
        type: 'error'
      });
      return;
    }

    try {
      const result = await invoke('setup_test_drive', {
        gamePath,
        vehicleId: selectedVehicle.vehicle_id,
        weaponId: selectedVehicle.weapon_id
      });
      
      setStatus({
        message: 'Test drive setup complete',
        type: 'success'
      });
    } catch (error) {
      setStatus({
        message: error as string,
        type: 'error'
      });
    }
  };

  const handleAutoDetect = async () => {
    try {
      const foundPath = await invoke<string | null>('find_warthunder_directory');
      if (foundPath) {
        await saveDirectory(foundPath);
        setGamePath(foundPath);
        setStatus({
          message: 'War Thunder installation found!',
          type: 'success'
        });
      } else {
        setStatus({
          message: 'Could not find War Thunder installation automatically',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error finding War Thunder directory:', error);
      setStatus({
        message: 'Error while searching for War Thunder',
        type: 'error'
      });
    }
  };

  return (
    <div className="h-screen min-h-[600px] min-w-[800px] overflow-hidden bg-background text-foreground p-6">
      <div className="grid h-[calc(100vh-3rem)] grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>War Thunder Test Drive Tool</CardTitle>
            <CardDescription>Configure and launch test drives</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Game Path</label>
              <div className="flex space-x-2">
                <Input value={gamePath} readOnly className="flex-1" />
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleBrowse} variant="secondary" size="icon">
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Browse for War Thunder installation folder</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleAutoDetect} variant="secondary" size="icon">
                        <Crosshair className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Auto-detect War Thunder installation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <SearchBar value={searchQuery} onChange={setSearchQuery} />

            {selectedVehicle && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Selected Vehicle</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {selectedVehicle.name}
                    <br />
                    {selectedVehicle.nation}, Rank {selectedVehicle.rank}
                  </p>
                </CardContent>
              </Card>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleSetupTestDrive}
              disabled={!selectedVehicle || !gamePath}
            >
              <Play className="mr-2 h-4 w-4" />
              Setup Test Drive
            </Button>

            <StatusAlert status={status} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle>Available Vehicles</CardTitle>
            <CardDescription>
              Select a vehicle to set up for test drive
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <VehicleList
              vehicles={filteredVehicles}
              selectedVehicleId={selectedVehicle?.vehicle_id || null}
              onVehicleSelect={setSelectedVehicle}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}