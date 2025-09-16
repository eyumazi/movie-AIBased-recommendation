
"use client";

import { useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Wand2, AlertTriangle } from 'lucide-react';
import { suggestMoviesByMood, type SuggestMoviesByMoodInput, type SuggestMoviesByMoodOutput } from '@/ai/flows/suggest-movies-by-mood-flow';
import { Movie } from '@/types';
import { getMovieById } from '@/lib/omdb';
import { MovieCard } from '@/components/MovieCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const vibeOptions = [
    { value: 'a fun escape', label: 'I want a fun escape' },
    { value: 'something that makes me think', label: 'I want something that makes me think' },
    { value: 'an emotional journey', label: 'I want to feel all the feels' },
    { value: 'an adrenaline rush', label: 'I want an adrenaline rush' },
];

const storyOptions = [
    { value: 'a clever plot with lots of twists', label: 'A clever plot with lots of twists' },
    { value: 'a heartwarming story about people', label: 'A heartwarming story about people' },
    { value: 'an epic adventure in another world', label: 'An epic adventure in another world' },
    { value: 'something I can just switch my brain off for', label: 'Something I can just switch my brain off for' },
];

export default function MoodSearchPage() {
    const { register, handleSubmit, control, formState: { errors } } = useForm<SuggestMoviesByMoodInput>();
    const [recommendations, setRecommendations] = useState<SuggestMoviesByMoodOutput['recommendations']>([]);
    const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const onSubmit = (data: SuggestMoviesByMoodInput) => {
        startTransition(async () => {
            setError(null);
            setRecommendations([]);
            setRecommendedMovies([]);
            try {
                const result = await suggestMoviesByMood(data);
                setRecommendations(result.recommendations);
                
                const moviePromises = result.recommendations.map(async (rec) => {
                    const movieDetails = await getMovieById(rec.imdbID);
                    return movieDetails;
                });
                
                const movies = await Promise.all(moviePromises);
                setRecommendedMovies(movies.filter((m): m is Movie => m !== null && m.Poster !== 'N/A'));

            } catch (err) {
                console.error(err);
                setError("Sorry, the AI had trouble finding movies for that mood. Please try a different description.");
            }
        });
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <Sparkles className="w-12 h-12 text-primary mx-auto" />
                <h1 className="font-headline text-4xl font-bold mt-2">Find a Movie for Your Mood</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Answer a few questions, and our AI will find the perfect movie for you.
                </p>
            </div>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>What are you in the mood for?</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                             <Label>Describe your current vibe...</Label>
                             <Controller
                                name="vibe"
                                control={control}
                                rules={{ required: "Please select a vibe." }}
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                                        {vibeOptions.map(option => (
                                            <Label key={option.value} className="flex items-center gap-2 p-3 rounded-md border has-[:checked]:bg-accent has-[:checked]:text-accent-foreground cursor-pointer">
                                                <RadioGroupItem value={option.value} id={`vibe-${option.value}`} />
                                                {option.label}
                                            </Label>
                                        ))}
                                    </RadioGroup>
                                )}
                            />
                            {errors.vibe && <p className="text-sm text-destructive">{errors.vibe.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>What kind of story are you looking for?</Label>
                             <Controller
                                name="story"
                                control={control}
                                rules={{ required: "Please select a story type." }}
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-1">
                                         {storyOptions.map(option => (
                                            <Label key={option.value} className="flex items-center gap-2 p-3 rounded-md border has-[:checked]:bg-accent has-[:checked]:text-accent-foreground cursor-pointer">
                                                <RadioGroupItem value={option.value} id={`story-${option.value}`} />
                                                {option.label}
                                            </Label>
                                        ))}
                                    </RadioGroup>
                                )}
                            />
                            {errors.story && <p className="text-sm text-destructive">{errors.story.message}</p>}
                        </div>

                         <div className="space-y-2">
                             <Label htmlFor="avoid">Anything you want to avoid? (Optional)</Label>
                            <Input id="avoid" placeholder="e.g., 'too scary', 'no sad endings'" {...register("avoid")} />
                        </div>
                        
                        <Button type="submit" disabled={isPending} className="w-full">
                            <Wand2 className="mr-2 h-4 w-4" />
                            {isPending ? 'Finding Perfect Movies...' : 'Find Movies'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {error && (
                <Alert variant="destructive" className="max-w-2xl mx-auto">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isPending && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-6">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <CardHeader className="p-0">
                            <Skeleton className="h-[330px] w-full rounded-t-lg" />
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-10 w-full mt-2" />
                        </CardContent>
                    </Card>
                ))}
                </div>
            )}
            
            {!isPending && recommendedMovies.length > 0 && (
                <div className="space-y-8">
                     <h2 className="font-headline text-3xl font-bold text-center">Here's what our AI found for you</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-6">
                        {recommendedMovies.map((movie) => {
                            const recData = recommendations.find(r => r.imdbID === movie.imdbID);
                            return (
                                <div key={movie.imdbID} className="flex flex-col gap-2">
                                     <MovieCard movie={movie} />
                                     {recData && (
                                        <Card className="bg-background/50 text-sm">
                                            <CardContent className="p-3">
                                            <p><span className="font-semibold text-primary/80">AI says:</span> {recData.reason}</p>
                                            </CardContent>
                                        </Card>
                                     )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
