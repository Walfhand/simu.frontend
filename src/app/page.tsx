"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { SimulationResult } from "@/types/simulation";
import { FILTER } from "@/services/httpClient";

export default function Home() {
  const [formData, setFormData] = useState({
    capital: 0,
    duration: 0,
    income: 0,
  });

  const [simulationResult, setSimulationResult] =
    useState<SimulationResult | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSimulation = () => {
    // Mock response
    FILTER<SimulationResult>("api/simulations", {
      capital: formData.capital,
      duration: formData.duration,
      annualIncome: formData.income,
    }).then((result) => {
      setSimulationResult(result!);
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <main className="container mx-auto p-4 h-screen">
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Left Card - Input Form */}
        <Card className="col-span-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Vos données</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid w-full items-center gap-1">
                <Label htmlFor="capital">Capital souhaité</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    id="capital"
                    placeholder="Entrez le montant"
                    value={formData.capital}
                    onChange={handleInputChange}
                    className="h-8"
                  />
                  <span className="text-sm">€</span>
                </div>
              </div>

              <div className="grid w-full items-center gap-1">
                <Label htmlFor="duration">Durée souhaitée</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    id="duration"
                    placeholder="Entrez la durée"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="h-8"
                  />
                  <span className="text-sm">mois</span>
                </div>
              </div>

              <div className="grid w-full items-center gap-1">
                <Label htmlFor="income">Vos revenus (RIG)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    id="income"
                    placeholder="Entrez vos revenus"
                    value={formData.income}
                    onChange={handleInputChange}
                    className="h-8"
                  />
                  <span className="text-sm">€/an</span>
                </div>
              </div>

              <Button className="w-full h-8 mt-2" onClick={handleSimulation}>
                Lancer la simulation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Card - Results */}
        <Card className="col-span-8 h-full flex flex-col">
          <CardHeader>
            <CardTitle>Notre proposition</CardTitle>
            <div className="flex justify-between mt-2">
              <div>
                <span className="text-sm text-muted-foreground">
                  Taux annuel fixe :
                </span>{" "}
                <span>
                  {simulationResult
                    ? `${simulationResult.fixedAnnualRate}%`
                    : "--"}
                </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Mensualité :
                </span>{" "}
                <span>
                  {simulationResult
                    ? formatCurrency(simulationResult.monthlyAmount)
                    : "--"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <div className="relative h-full">
              <div className="overflow-hidden rounded-md border h-full flex flex-col">
                <div className="relative">
                  <Table>
                    <TableHeader className="bg-background sticky top-0">
                      <TableRow>
                        <TableHead className="w-[140px]">Mois</TableHead>
                        <TableHead>Mensualité</TableHead>
                        <TableHead>Part d&apos;intérêts</TableHead>
                        <TableHead>Part de capital</TableHead>
                        <TableHead>Solde restant dû</TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                </div>
                <div className="flex-1 overflow-auto">
                  <Table>
                    <TableBody>
                      {simulationResult?.depreciationTableLines.map((line) => (
                        <TableRow key={line.month}>
                          <TableCell className="w-[140px]">
                            {line.month}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(line.monthlyAmount)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(line.interestShare)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(line.capitalShare)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(line.remainingBalance)}
                          </TableCell>
                        </TableRow>
                      )) ?? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            Aucune donnée disponible
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
