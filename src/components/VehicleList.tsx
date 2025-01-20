'use client';

import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Vehicle } from "@/types/vehicles";

interface VehicleListProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onVehicleSelect: (vehicle: Vehicle) => void;
  isLoading: boolean;
}

export default function VehicleList({ 
  vehicles, 
  selectedVehicleId, 
  onVehicleSelect,
  isLoading 
}: VehicleListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading vehicles...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-md border">
      {/* Fixed Header */}
      <div className="absolute top-0 left-0 right-4 bg-background z-10 border-b">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Vehicle ID</TableHead>
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead className="w-[150px]">Nation</TableHead>
              <TableHead className="w-[100px]">Rank</TableHead>
              <TableHead className="text-center w-[100px]">AB BR</TableHead>
              <TableHead className="text-center w-[100px]">RB BR</TableHead>
              <TableHead className="text-center w-[100px]">SB BR</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="h-full w-full pt-12">
        <Table>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow
                key={vehicle.vehicle_id}
                className={`cursor-pointer hover:bg-muted/50 ${
                  vehicle.vehicle_id === selectedVehicleId ? 'bg-muted' : ''
                }`}
                onClick={() => onVehicleSelect(vehicle)}
              >
                <TableCell className="font-mono w-[200px]">{vehicle.vehicle_id}</TableCell>
                <TableCell className="font-medium w-[250px]">{vehicle.name}</TableCell>
                <TableCell className="w-[150px]">{vehicle.nation}</TableCell>
                <TableCell className="w-[100px]">{vehicle.rank}</TableCell>
                <TableCell className="text-center w-[100px]">{vehicle.AB_BR || '-'}</TableCell>
                <TableCell className="text-center w-[100px]">{vehicle.RB_BR || '-'}</TableCell>
                <TableCell className="text-center w-[100px]">{vehicle.SB_BR || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}