"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Stethoscope,
  FileText,
  Microscope,
  User,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Award,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logClinicCase } from "@/lib/actions/clinic";
import { useRouter } from "next/navigation";

interface CaseData {
  patient_story: string;
  hidden_investigations: Record<string, string>;
  diagnosis_options: string[];
  correct_answer: string;
  debrief: string;
  budget: number;
}

// Investigation costs
const INVESTIGATION_COSTS: Record<string, number> = {
  physical_exam: 0, // Free - first test
  complete_blood_count: 50,
  metabolic_panel: 75,
  hormone_panel: 100,
  lipid_panel: 50,
  genetic_testing: 200,
  karyotype: 150,
  enzyme_assay: 125,
  imaging: 175,
  specialized_tests: 150,
};

const INVESTIGATION_NAMES: Record<string, string> = {
  physical_exam: "Physical Examination",
  complete_blood_count: "Complete Blood Count (CBC)",
  metabolic_panel: "Basic Metabolic Panel",
  hormone_panel: "Hormone Panel",
  lipid_panel: "Lipid Panel",
  genetic_testing: "Genetic Testing",
  karyotype: "Karyotype Analysis",
  enzyme_assay: "Enzyme Assay",
  imaging: "Imaging (X-ray/MRI/Echo)",
  specialized_tests: "Specialized Tests",
};

export default function ClinicPage() {
  const router = useRouter();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealedInvestigations, setRevealedInvestigations] = useState<Set<string>>(new Set());
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [budget, setBudget] = useState(500);
  const [selectedInvestigation, setSelectedInvestigation] = useState<string>("");

  const loadNewCase = async () => {
    setLoading(true);
    setCaseData(null);
    setRevealedInvestigations(new Set());
    setSelectedAnswer(null);
    setSubmitted(false);
    setXpEarned(0);
    setBudget(500);
    setSelectedInvestigation("");

    try {
      const response = await fetch("/api/clinic", {
        method: "POST",
      });
      const data = await response.json();
      
      if (data.error) {
        console.error("Error loading case:", data.error);
      } else {
        setCaseData(data);
        setBudget(data.budget || 500);
      }
    } catch (error) {
      console.error("Error loading case:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNewCase();
  }, []);

  const orderInvestigation = () => {
    if (!selectedInvestigation || !caseData) return;
    
    const cost = INVESTIGATION_COSTS[selectedInvestigation] || 0;
    
    // Physical exam is always free
    if (selectedInvestigation !== "physical_exam" && cost > budget) {
      return; // Can't afford
    }
    
    if (!revealedInvestigations.has(selectedInvestigation)) {
      setRevealedInvestigations((prev) => new Set([...prev, selectedInvestigation]));
      if (selectedInvestigation !== "physical_exam") {
        setBudget((prev) => prev - cost);
      }
    }
    setSelectedInvestigation("");
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !caseData) return;
    
    setSubmitted(true);
    
    // Calculate XP based on correct answer and budget remaining
    const isCorrect = selectedAnswer === caseData.correct_answer;
    let xp = 0;
    if (isCorrect) {
      // Base XP for correct answer
      xp = 50;
      // Bonus for budget remaining (up to 30 XP)
      const budgetBonus = Math.floor((budget / (caseData.budget || 500)) * 30);
      xp += budgetBonus;
      setXpEarned(xp);
    }

    // Log the case to the database
    try {
      await logClinicCase(
        "", // userId will be fetched server-side
        caseData,
        selectedAnswer,
        caseData.correct_answer,
        isCorrect,
        xp
      );
      // Refresh the page data to update XP display
      router.refresh();
    } catch (error) {
      console.error("Error logging case:", error);
    }
  };

  // Get available investigations from case data
  const getAvailableInvestigations = () => {
    if (!caseData?.hidden_investigations) return [];
    return Object.keys(caseData.hidden_investigations).filter(
      (key) => !revealedInvestigations.has(key)
    );
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-slate-400">Generating patient case...</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">Failed to load patient case</p>
          <Button onClick={loadNewCase}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">The Clinic</h1>
            <p className="text-slate-400">Diagnose the patient</p>
          </div>
        </div>
        {!submitted && (
          <Button variant="outline" onClick={loadNewCase}>
            <RefreshCw className="w-4 h-4 mr-2" />
            New Case
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient Story */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" />
                Patient Presentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {caseData.patient_story}
              </p>
            </CardContent>
          </Card>

          {/* Investigations with Budget */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-purple-400" />
                  Order Investigations
                </CardTitle>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-emerald-400">{budget}</span>
                  <span className="text-slate-400 text-sm">budget</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Investigation Selector */}
              {!submitted && getAvailableInvestigations().length > 0 && (
                <div className="flex gap-2">
                  <Select value={selectedInvestigation} onValueChange={setSelectedInvestigation}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select an investigation..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableInvestigations().map((key) => {
                        const cost = INVESTIGATION_COSTS[key] || 0;
                        const canAfford = key === "physical_exam" || cost <= budget;
                        return (
                          <SelectItem 
                            key={key} 
                            value={key}
                            disabled={!canAfford}
                          >
                            <div className="flex items-center justify-between w-full gap-4">
                              <span>{INVESTIGATION_NAMES[key] || key}</span>
                              <span className={cn(
                                "text-sm",
                                cost === 0 ? "text-emerald-400" : canAfford ? "text-slate-400" : "text-red-400"
                              )}>
                                {cost === 0 ? "FREE" : `$${cost}`}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={orderInvestigation}
                    disabled={!selectedInvestigation}
                  >
                    Order
                  </Button>
                </div>
              )}

              {/* Revealed Investigations */}
              {Array.from(revealedInvestigations).map((key) => (
                <div key={key} className="p-4 rounded-xl border border-slate-700 bg-slate-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">
                      {INVESTIGATION_NAMES[key] || key}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {INVESTIGATION_COSTS[key] === 0 ? "FREE" : `$${INVESTIGATION_COSTS[key]}`}
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-sm">
                    {caseData.hidden_investigations[key]}
                  </p>
                </div>
              ))}

              {revealedInvestigations.size === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">
                  No investigations ordered yet. Physical exam is free!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Diagnosis Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Your Diagnosis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {caseData.diagnosis_options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === caseData.correct_answer;
                const showResult = submitted;

                return (
                  <button
                    key={index}
                    onClick={() => !submitted && setSelectedAnswer(option)}
                    disabled={submitted}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl border transition-all",
                      !showResult && isSelected && "border-emerald-500 bg-emerald-500/10",
                      !showResult && !isSelected && "border-slate-700 hover:border-slate-600",
                      showResult && isCorrect && "border-emerald-500 bg-emerald-500/10",
                      showResult && isSelected && !isCorrect && "border-red-500 bg-red-500/10",
                      showResult && !isSelected && !isCorrect && "border-slate-700 opacity-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200">{option}</span>
                      {showResult && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  </button>
                );
              })}

              {!submitted ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                  className="w-full mt-4"
                >
                  Submit Diagnosis
                </Button>
              ) : (
                <div className="mt-4 space-y-4">
                  {selectedAnswer === caseData.correct_answer ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-emerald-400" />
                        <span className="font-semibold text-emerald-400">
                          Correct Diagnosis!
                        </span>
                      </div>
                      <Badge variant="default" className="text-lg px-3 py-1">
                        +{xpEarned} XP
                      </Badge>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-400" />
                        <span className="font-semibold text-red-400">
                          Incorrect Diagnosis
                        </span>
                      </div>
                    </div>
                  )}
                  <Button onClick={loadNewCase} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Next Patient
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Debrief */}
          {submitted && (
            <Card className="border-amber-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-400">
                  <FileText className="w-5 h-5" />
                  Case Debrief
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {caseData.debrief}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
