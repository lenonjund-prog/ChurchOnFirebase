
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Settings, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ProfileForm, type ProfileFormValues } from '@/components/profile-form';


const settingsSchema = z.object({
  churchName: z.string().min(3, { message: 'O nome da igreja deve ter pelo menos 3 caracteres.' }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function SettingsPage() {
  const [user, userLoading] = useAuthState(auth);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    async function fetchSettings() {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.churchName) {
              setValue('churchName', data.churchName);
            }
            const profileData = {
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: data.email || user.email || '',
              phone: data.phone || ''
            };
            setUserProfile(profileData);
          }
        } catch (error) {
          console.error("Error fetching settings:", error);
          toast({
            variant: 'destructive',
            title: 'Erro ao carregar configurações',
            description: 'Não foi possível buscar as configurações atuais.',
          });
        } finally {
          setPageLoading(false);
        }
      }
    }
    if (!userLoading) {
        fetchSettings();
    }
  }, [user, userLoading, setValue, toast]);

  const onChurchNameSubmit = async (data: SettingsFormValues) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: 'Você precisa estar logado para salvar as configurações.',
      });
      return;
    }
    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, {
        churchName: data.churchName,
      });
      toast({
        title: 'Sucesso!',
        description: 'O nome da igreja foi atualizado com sucesso.',
      });
    } catch (error) {
      console.error('Error updating settings: ', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar',
        description: 'Não foi possível atualizar o nome da igreja. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (data: ProfileFormValues) => {
     if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar autenticado." });
      return;
    }
    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, data);
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
      toast({
        title: 'Sucesso!',
        description: 'Seu perfil foi atualizado.',
      });
      setIsSheetOpen(false);
    } catch(error) {
       console.error('Error updating profile: ', error);
       toast({
        variant: 'destructive',
        title: 'Erro ao Atualizar',
        description: 'Não foi possível atualizar seu perfil. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading || userLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Configurações da Igreja
            </CardTitle>
            <CardDescription>Personalize as informações da sua igreja.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onChurchNameSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="churchName">Nome da Igreja</Label>
                <Input
                  id="churchName"
                  placeholder="Ex: Igreja da Comunidade"
                  {...register('churchName')}
                />
                {errors.churchName && (
                  <p className="text-sm font-medium text-destructive">{errors.churchName.message}</p>
                )}
              </div>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </form>
          </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-6 w-6" />
                    Perfil do Usuário
                </CardTitle>
                <CardDescription>Suas informações de cadastro.</CardDescription>
            </CardHeader>
            <CardContent>
                {userProfile ? (
                    <div className="space-y-4 text-sm">
                        <div className='space-y-1'>
                            <p className="font-medium text-muted-foreground">Nome</p>
                            <p>{userProfile.firstName} {userProfile.lastName}</p>
                        </div>
                        <div className='space-y-1'>
                            <p className="font-medium text-muted-foreground">Email</p>
                            <p>{userProfile.email}</p>
                        </div>
                        <div className='space-y-1'>
                            <p className="font-medium text-muted-foreground">Telefone</p>
                            <p>{userProfile.phone}</p>
                        </div>
                    </div>
                ) : (
                    <p>Não foi possível carregar as informações do perfil.</p>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={() => setIsSheetOpen(true)}>Editar Perfil</Button>
            </CardFooter>
        </Card>
      </div>

       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
                <SheetTitle>Editar Perfil</SheetTitle>
                <SheetDescription>
                    Atualize suas informações pessoais.
                </SheetDescription>
            </SheetHeader>
            <ProfileForm
                onFormSubmit={handleProfileSubmit}
                onSheetClose={() => setIsSheetOpen(false)}
                profileData={userProfile}
            />
        </SheetContent>
      </Sheet>
    </div>
  );
}
