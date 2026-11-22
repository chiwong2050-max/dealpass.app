import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Wand2, Clock, CalendarDays, Sparkles, Home, Palmtree, Dumbbell, Car, Ticket, ThumbsUp, AlertTriangle, Copy, PlusCircle, Bot, Zap, CheckCircle2, ArrowRight, Lightbulb, BellRing, TrendingUp, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CreateOffer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [isSponsored, setIsSponsored] = useState(false);
  const [requiresBooking, setRequiresBooking] = useState(false);
  const [activeTab, setActiveTab] = useState('wizard'); // Default to wizard
  
  // Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
      businessType: 'Restaurant/Cafe',
      goal: 'fill_empty_tables',
      quietTime: 'weekdays'
  });
  const [generatedOptions, setGeneratedOptions] = useState<any[]>([]);

  // Time Restrictions State
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    longDescription: '',
    imageUrl: '',
    externalUrl: '',
    creditCost: '1', // Default to 1 (Standard)
    leadCost: '5',
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    primaryPromotionTypeCode: 'DISCOUNT',
    totalLimit: '',
    dailyLimit: '',
    perUserLimit: '1',
  });

  // Handle Duplication / Pre-fill / Optimization
  useEffect(() => {
    if (location.state) {
        if (location.state.offerToDuplicate) {
             const source = location.state.offerToDuplicate;
             loadOfferData(source, true); // True for copy mode
             setActiveTab('manual');
        } else if (location.state.offerToOptimize) {
             const source = location.state.offerToOptimize;
             loadOfferData(source, false);
             // Apply AI Optimization immediately
             toast.info("AI is applying optimization suggestions...");
             setFormData(prev => ({
                 ...prev,
                 title: `⚡ IMPROVED: ${source.title}`,
                 creditCost: '1', // Reset to standard
                 shortDescription: `(AI Tweaked) ${source.shortDescription} - Limited Time!`
             }));
             setActiveTab('manual');
        }
    }
  }, [location.state]);

  const loadOfferData = (source: any, isCopy: boolean) => {
    setFormData(prev => ({
        ...prev,
        title: isCopy ? `${source.title} (Copy)` : source.title,
        shortDescription: source.shortDescription,
        longDescription: source.longDescription || '',
        imageUrl: source.imageUrl || '',
        externalUrl: source.externalUrl || '',
        creditCost: String(source.creditCost),
        leadCost: String(source.leadCost || '0'),
        primaryPromotionTypeCode: source.primaryPromotionTypeCode,
        perUserLimit: String(source.perUserLimit || '1'),
        totalLimit: source.totalLimit ? String(source.totalLimit) : '',
        dailyLimit: source.dailyLimit ? String(source.dailyLimit) : ''
    }));
    
    if (source.timeDetails) {
        setStartTime(source.timeDetails.startTime || '');
        setEndTime(source.timeDetails.endTime || '');
        setSelectedDays(source.timeDetails.days || []);
    }
    
    if (source.eligibilityDetails) {
        setRequiresBooking(!!source.eligibilityDetails.requiresBooking);
    }

    if (source.leadCost > 0) {
        setIsSponsored(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
        setSelectedDays(prev => prev.filter(d => d !== day));
    } else {
        setSelectedDays(prev => [...prev, day]);
    }
  };

  // --- WIZARD LOGIC ---

  const generateWizardOptions = () => {
    setAiGenerating(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
        const options = [];
        const { businessType, goal, quietTime } = wizardData;
        
        // Logic for generating tailored offers based on inputs
        if (goal === 'fill_empty_tables') {
            options.push({
                title: "2-for-1 Main Meals (Tue-Wed)",
                shortDescription: "Bring a friend! Buy one main meal and get the second for free.",
                longDescription: "Dine with us on Tuesday or Wednesday evenings and enjoy a complimentary main course when you purchase another of equal or greater value.\n\nGreat for date nights or catching up with friends without breaking the bank.",
                type: 'BOGO',
                creditCost: '2', // High value deal
                days: ['Tue', 'Wed'],
                startTime: '17:00',
                endTime: '21:00'
            });
            options.push({
                title: "Early Bird Special: 30% Off Bill",
                shortDescription: "Dine between 5pm-6pm and save 30% on your total bill.",
                longDescription: "Beat the rush! Book a table between 5pm and 6pm on weekdays and receive 30% off your entire bill (drinks included).\n\nPerfect for an early family dinner.",
                type: 'DISCOUNT',
                creditCost: '1', // Standard deal
                days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                startTime: '17:00',
                endTime: '18:00'
            });
        } else if (goal === 'new_customers') {
            options.push({
                title: "50% Off First Visit",
                shortDescription: "New to us? Enjoy half price on your first experience.",
                longDescription: "We'd love to welcome you! First-time customers get 50% off any service/meal.\n\nCome see why locals love us.",
                type: 'DISCOUNT',
                creditCost: '3', // Premium acquisition deal
                days: [],
                startTime: '',
                endTime: ''
            });
        } else {
            // Generic fallback
             options.push({
                title: "Free Drink with Any Purchase",
                shortDescription: "Unlock a complimentary house drink with any main meal.",
                longDescription: "Cheers to you! Show this coupon to receive a free house wine, beer, or soft drink with any main meal order.",
                type: 'GIFT',
                creditCost: '1',
                days: [],
                startTime: '',
                endTime: ''
            });
        }

        setGeneratedOptions(options);
        setAiGenerating(false);
        setWizardStep(2);
    }, 1500);
  };

  const selectWizardOption = (option: any) => {
      setFormData(prev => ({
          ...prev,
          title: option.title,
          shortDescription: option.shortDescription,
          longDescription: option.longDescription,
          primaryPromotionTypeCode: option.type,
          creditCost: option.creditCost
      }));

      if (option.days) setSelectedDays(option.days);
      if (option.startTime) setStartTime(option.startTime);
      if (option.endTime) setEndTime(option.endTime);

      setActiveTab('manual');
      toast.success("Offer draft created! Please review and publish.");
  };

  // --- MANUAL AI FEATURES ---

  const generateWithAI = async () => {
    if (!formData.title && !formData.shortDescription) {
        toast.error("Please enter at least a Title or keyword (e.g., 'Burger') to guide the AI.");
        return;
    }
    
    setAiGenerating(true);
    // SIMULATED AI CALL
    setTimeout(() => {
        const keyword = formData.title || "Special Offer";
        
        setFormData(prev => ({
            ...prev,
            title: `Exclusive: 50% Off ${keyword}`,
            shortDescription: `Enjoy the best ${keyword} in town for half price. Limited time only!`,
            longDescription: `We invite you to experience our signature ${keyword}. \n\nThis exclusive member offer gives you 50% off your total bill when you dine with us during the week. Perfect for a date night or a catch-up with friends.\n\nTerms: Valid for dine-in only. Not valid with other offers.`,
            primaryPromotionTypeCode: 'DISCOUNT',
            creditCost: '2'
        }));
        
        toast.success("AI has generated your offer content!");
        setAiGenerating(false);
    }, 1500);
  };

  const calculateQualityScore = () => {
      let score = 0;
      const suggestions = [];
      const titleLower = formData.title.toLowerCase();

      // 1. Weak Offer Detection (Risk Mitigation #2)
      if (titleLower.includes('5%') || titleLower.includes('10%')) {
         score -= 20;
         suggestions.push("Low Conversion Risk: Offers under 15% rarely work. Try 20%+ or a free item.");
      }
      
      // 2. High Value Detection
      if (titleLower.includes('50%') || titleLower.includes('half price') || titleLower.includes('2-for-1') || titleLower.includes('free')) {
          score += 30;
      } else if (titleLower.includes('20%') || titleLower.includes('25%') || titleLower.includes('30%')) {
          score += 15;
      } else {
          suggestions.push("Tip: Include a specific benefit (e.g. '50% Off' or 'Free Drink') in the title.");
      }

      // 3. Length Checks
      if (formData.title.length > 10) score += 10;
      else suggestions.push("Title is too short.");
      
      if (formData.shortDescription.length > 20) score += 10;
      else suggestions.push("Short description needs more detail.");

      // 4. Cost Check
      if (parseInt(formData.creditCost) <= 3) score += 10; 
      else suggestions.push("Credit cost is high. 1-3 is recommended.");

      // 5. Time Restrictions (Off-peak is good)
      if (selectedDays.length > 0 && selectedDays.length < 7) {
          score += 20; // Specific days = targeted offer
      }

      // 6. Booking
      if (requiresBooking) score += 10; // Captures intent

      // 7. Image
      if (formData.imageUrl.length > 10) score += 10;
      else suggestions.push("Add a high-quality image URL.");

      return { score: Math.min(Math.max(score, 0), 100), suggestions };
  };

  const { score, suggestions } = calculateQualityScore();
  const getScoreColor = (s: number) => {
      if (s < 50) return 'text-red-500';
      if (s < 80) return 'text-yellow-500';
      return 'text-green-500';
  };

  // --- SUBMIT ---

  const handleSubmit = async (e: React.FormEvent, status: 'ACTIVE' | 'DRAFT' = 'ACTIVE') => {
    e.preventDefault();
    setLoading(true);

    const timeDetails = {
        startTime,
        endTime,
        days: selectedDays
    };

    const eligibilityDetails = {
        requiresBooking
    };

    const payload = {
        ...formData,
        creditCost: isSponsored ? '0' : formData.creditCost,
        leadCost: isSponsored ? formData.leadCost : '0',
        timeDetails,
        eligibilityDetails,
        status, // Pass the explicit status (e.g. DRAFT)
        // Tag with AI score for admin visibility
        aiModerationResult: {
            qualityScore: score,
            autoGenerated: false 
        }
    };

    try {
      const res = await api.post('/offers', payload);
      
      // Handle Retargeting Feedback
      if (res.data.retargeting && res.data.retargeting.count > 0) {
          toast.success(res.data.retargeting.message, {
              duration: 5000,
              icon: <BellRing className="w-5 h-5 text-green-500" />
          });
      } else {
          toast.success(status === 'DRAFT' ? 'Draft saved successfully!' : 'Offer published successfully!');
      }

      navigate('/business/dashboard');
    } catch (error: any) {
      console.error('Failed to create offer:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create offer.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center pb-20">
      <Card className="w-full max-w-5xl">
        <CardHeader>
           <div className="flex justify-between items-center">
             <CardTitle className="text-2xl">Create New Offer</CardTitle>
             <div className="flex bg-muted rounded-lg p-1">
                 <Button 
                    variant={activeTab === 'wizard' ? 'secondary' : 'ghost'} 
                    size="sm"
                    onClick={() => setActiveTab('wizard')}
                    className="flex items-center gap-2"
                 >
                    <Bot className="w-4 h-4" /> Smart Wizard
                 </Button>
                 <Button 
                    variant={activeTab === 'manual' ? 'secondary' : 'ghost'} 
                    size="sm"
                    onClick={() => setActiveTab('manual')}
                    className="flex items-center gap-2"
                 >
                    <PlusCircle className="w-4 h-4" /> Manual Builder
                 </Button>
             </div>
           </div>
        </CardHeader>
        <CardContent>
          
          {activeTab === 'wizard' ? (
              <div className="space-y-8 py-4">
                  {wizardStep === 1 && (
                      <div className="space-y-6 max-w-xl mx-auto">
                          <div className="text-center space-y-2">
                              <h3 className="text-xl font-bold">Let's build the perfect deal.</h3>
                              <p className="text-muted-foreground">Answer 3 questions and our AI will generate high-converting offers for you.</p>
                          </div>
                          
                          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
                              <div className="space-y-2">
                                  <Label>1. What type of business are you?</Label>
                                  <Select 
                                    value={wizardData.businessType} 
                                    onValueChange={(v) => setWizardData(prev => ({...prev, businessType: v}))}
                                  >
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="Restaurant/Cafe">Restaurant / Cafe</SelectItem>
                                          <SelectItem value="Spa/Salon">Spa / Salon</SelectItem>
                                          <SelectItem value="Activity/Entertainment">Activity / Entertainment</SelectItem>
                                          <SelectItem value="Retail">Retail Store</SelectItem>
                                          <SelectItem value="Services">Professional Services</SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>

                              <div className="space-y-2">
                                  <Label>2. What is your main goal?</Label>
                                  <Select 
                                    value={wizardData.goal} 
                                    onValueChange={(v) => setWizardData(prev => ({...prev, goal: v}))}
                                  >
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="fill_empty_tables">Fill Empty Slots/Tables</SelectItem>
                                          <SelectItem value="new_customers">Attract New Customers</SelectItem>
                                          <SelectItem value="increase_spend">Increase Spend per Visit</SelectItem>
                                          <SelectItem value="clear_stock">Clear Excess Stock</SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>

                              <div className="space-y-2">
                                  <Label>3. When are you usually quietest?</Label>
                                  <Select 
                                    value={wizardData.quietTime} 
                                    onValueChange={(v) => setWizardData(prev => ({...prev, quietTime: v}))}
                                  >
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="weekdays">Weekdays (Mon-Thu)</SelectItem>
                                          <SelectItem value="mornings">Mornings</SelectItem>
                                          <SelectItem value="afternoons">Afternoons (2pm - 5pm)</SelectItem>
                                          <SelectItem value="late_night">Late Night</SelectItem>
                                          <SelectItem value="anytime">Anytime is fine</SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>
                          </div>

                          <Button 
                            className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" 
                            onClick={generateWizardOptions}
                            disabled={aiGenerating}
                          >
                             {aiGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                             Generate Strategies
                          </Button>
                      </div>
                  )}

                  {wizardStep === 2 && (
                      <div className="space-y-6">
                           <div className="text-center space-y-2">
                              <h3 className="text-xl font-bold">Pick a strategy</h3>
                              <p className="text-muted-foreground">We generated these options based on your goals.</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {generatedOptions.map((opt, idx) => (
                                  <Card key={idx} className="hover:border-primary cursor-pointer transition-all hover:shadow-md" onClick={() => selectWizardOption(opt)}>
                                      <CardHeader>
                                          <CardTitle className="text-lg">{opt.title}</CardTitle>
                                          <CardDescription>{opt.shortDescription}</CardDescription>
                                      </CardHeader>
                                      <CardContent>
                                          <p className="text-sm text-gray-500 line-clamp-3">{opt.longDescription}</p>
                                          <div className="mt-4 flex flex-wrap gap-2">
                                              {opt.days && opt.days.length > 0 && (
                                                  <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                                                      {opt.days.join(', ')}
                                                  </div>
                                              )}
                                              {opt.startTime && (
                                                  <div className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs font-semibold flex items-center">
                                                      <Clock className="w-3 h-3 mr-1" /> {opt.startTime} - {opt.endTime}
                                                  </div>
                                              )}
                                          </div>
                                      </CardContent>
                                      <CardFooter>
                                          <Button variant="outline" className="w-full group">
                                              Select & Edit <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                          </Button>
                                      </CardFooter>
                                  </Card>
                              ))}
                          </div>
                          
                          <div className="text-center">
                              <Button variant="ghost" onClick={() => setWizardStep(1)}>Back to questions</Button>
                          </div>
                      </div>
                  )}
              </div>
          ) : (
            <form onSubmit={(e) => handleSubmit(e, 'ACTIVE')} className="space-y-6">
            
            {/* AI Assistant Button Manual */}
             <div className="flex justify-end mb-2">
                <Button 
                    type="button" 
                    variant="outline"
                    onClick={generateWithAI} 
                    disabled={aiGenerating}
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                    {aiGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Re-write with AI
                </Button>
            </div>

            {/* Basic Details */}
            <div className="space-y-4 border-b pb-4">
                <div className="space-y-2">
                <Label htmlFor="title">Offer Title</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="e.g. 50% Off First Visit"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="primaryPromotionTypeCode">Promotion Type</Label>
                        <Select 
                        name="primaryPromotionTypeCode" 
                        value={formData.primaryPromotionTypeCode} 
                        onValueChange={(value) => handleSelectChange('primaryPromotionTypeCode', value)}
                        >
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DISCOUNT">Discount</SelectItem>
                            <SelectItem value="BOGO">Buy One Get One</SelectItem>
                            <SelectItem value="FREE_TRIAL">Free Trial / Intro</SelectItem>
                            <SelectItem value="GIFT">Gift / Free Item</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-md border">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="isSponsored" className="font-semibold flex items-center gap-2">
                                Pay Per Lead? 
                                <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            </Label>
                            <Switch id="isSponsored" checked={isSponsored} onCheckedChange={setIsSponsored} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {isSponsored ? "You pay, users unlock for FREE." : "User pays credits to unlock."}
                        </p>
                        
                        {isSponsored ? (
                             <Input
                                id="leadCost"
                                name="leadCost"
                                type="number"
                                min="0"
                                value={formData.leadCost}
                                onChange={handleChange}
                                className="h-8 mt-2"
                                placeholder="Cost per lead (Credits)"
                            />
                        ) : (
                             <div className="space-y-2 mt-2">
                                <Label className="text-xs">User Unlock Cost</Label>
                                <Select 
                                    name="creditCost" 
                                    value={formData.creditCost} 
                                    onValueChange={(value) => handleSelectChange('creditCost', value)}
                                >
                                    <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Select Cost" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Credit (Standard)</SelectItem>
                                        <SelectItem value="2">2 Credits (High Value)</SelectItem>
                                        <SelectItem value="3">3 Credits (Premium/Rare)</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Input
                        id="shortDescription"
                        name="shortDescription"
                        placeholder="Brief summary shown on cards"
                        value={formData.shortDescription}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            {/* Time & Validity */}
            <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-gray-500" /> When is this valid?
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Start Time (Optional)</Label>
                        <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                     </div>
                     <div className="space-y-2">
                        <Label>End Time (Optional)</Label>
                        <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                     </div>
                </div>

                <div className="space-y-2">
                    <Label>Valid Days</Label>
                    <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map(day => (
                            <div 
                                key={day} 
                                onClick={() => toggleDay(day)}
                                className={`
                                    cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-colors border
                                    ${selectedDays.includes(day) 
                                        ? 'bg-primary text-primary-foreground border-primary' 
                                        : 'bg-background hover:bg-muted text-muted-foreground border-input'}
                                `}
                            >
                                {day}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                        id="requiresBooking" 
                        checked={requiresBooking} 
                        onCheckedChange={(checked) => setRequiresBooking(checked as boolean)} 
                    />
                    <label
                        htmlFor="requiresBooking"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Require Reservation? (User must select a time to unlock)
                    </label>
                </div>
            </div>

            {/* Fine Print */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="longDescription">Terms & Conditions / Details</Label>
                    <Textarea
                        id="longDescription"
                        name="longDescription"
                        placeholder="Specific details, exclusions, etc."
                        value={formData.longDescription}
                        onChange={handleChange}
                        rows={3}
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Valid From</Label>
                        <Input type="date" name="validFrom" value={formData.validFrom} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Valid To</Label>
                        <Input type="date" name="validTo" value={formData.validTo} onChange={handleChange} required />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                        id="imageUrl"
                        name="imageUrl"
                        placeholder="https://..."
                        value={formData.imageUrl}
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* AI Quality Score Indicator */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        <span className="font-bold text-sm">AI Deal Rater</span>
                    </div>
                    <span className={`font-bold text-lg ${getScoreColor(score)}`}>{score}/100</span>
                </div>
                <Progress value={score} className="h-2 mb-3" />
                
                {suggestions.length > 0 ? (
                    <div className="space-y-2">
                        {suggestions.map((s, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-gray-500 bg-white p-2 rounded shadow-sm border">
                                <AlertTriangle className="h-3 w-3 mt-0.5 text-yellow-500 shrink-0" /> 
                                <span>{s}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center text-xs text-green-600 font-medium p-2 bg-green-50 border border-green-100 rounded">
                        <TrendingUp className="h-3 w-3 mr-1" /> Perfect! This offer is optimized for high conversion.
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 py-6 text-lg"
                    disabled={loading}
                    onClick={(e) => handleSubmit(e, 'DRAFT')}
                >
                    <Save className="mr-2 h-5 w-5" /> Save Draft
                </Button>
                <Button 
                    type="submit" 
                    className="flex-[2] py-6 text-lg" 
                    disabled={loading}
                >
                    {loading ? (
                        <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Publishing...
                        </>
                    ) : (
                        location.state?.offerToDuplicate ? 'Duplicate & Publish' : 'Publish Offer'
                    )}
                </Button>
            </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOffer;