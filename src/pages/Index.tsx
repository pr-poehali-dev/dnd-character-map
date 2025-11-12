import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Character {
  name: string;
  race: string;
  class: string;
  level: number;
  attributes: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  hp: number;
  maxHp: number;
  ac: number;
  inventory: InventoryItem[];
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description: string;
}

const defaultCharacter: Character = {
  name: 'Неизвестный герой',
  race: 'Человек',
  class: 'Воин',
  level: 1,
  attributes: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  },
  hp: 10,
  maxHp: 10,
  ac: 10,
  inventory: []
};

const Index = () => {
  const [character, setCharacter] = useState<Character>(defaultCharacter);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, description: '' });
  const [importData, setImportData] = useState('');
  const { toast } = useToast();

  const calculateModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  const handleAttributeChange = (attr: keyof Character['attributes'], value: number) => {
    setCharacter(prev => ({
      ...prev,
      attributes: { ...prev.attributes, [attr]: Math.max(1, Math.min(30, value)) }
    }));
  };

  const addInventoryItem = () => {
    if (!newItem.name.trim()) {
      toast({ title: 'Ошибка', description: 'Введите название предмета', variant: 'destructive' });
      return;
    }
    const item: InventoryItem = {
      id: Date.now().toString(),
      ...newItem
    };
    setCharacter(prev => ({ ...prev, inventory: [...prev.inventory, item] }));
    setNewItem({ name: '', quantity: 1, description: '' });
    toast({ title: 'Предмет добавлен', description: `${item.name} добавлен в инвентарь` });
  };

  const removeInventoryItem = (id: string) => {
    setCharacter(prev => ({
      ...prev,
      inventory: prev.inventory.filter(item => item.id !== id)
    }));
    toast({ title: 'Предмет удалён', description: 'Предмет удалён из инвентаря' });
  };

  const exportCharacter = () => {
    const dataStr = JSON.stringify(character, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${character.name.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Экспорт завершён', description: 'Персонаж сохранён в файл' });
  };

  const importCharacter = () => {
    try {
      const parsed = JSON.parse(importData);
      setCharacter(parsed);
      setImportData('');
      toast({ title: 'Импорт завершён', description: 'Персонаж успешно загружен' });
    } catch (error) {
      toast({ title: 'Ошибка импорта', description: 'Неверный формат данных', variant: 'destructive' });
    }
  };

  const AttributeCard = ({ name, value, onChange }: { name: string; value: number; onChange: (v: number) => void }) => {
    const modifier = calculateModifier(value);
    const modifierSign = modifier >= 0 ? '+' : '';
    
    return (
      <Card className="parchment-texture border-2 border-primary/30 hover:border-primary/60 transition-all">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-primary text-center">{name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-4xl font-bold text-center text-accent glow-text animate-glow">
            {value}
          </div>
          <div className="text-center text-muted-foreground">
            Модификатор: <span className="text-primary font-semibold">{modifierSign}{modifier}</span>
          </div>
          <div className="flex gap-2 justify-center mt-3">
            <Button
              size="icon"
              variant="outline"
              onClick={() => onChange(value - 1)}
              className="h-8 w-8 border-primary/40 hover:bg-primary/20"
            >
              <Icon name="Minus" size={14} />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => onChange(value + 1)}
              className="h-8 w-8 border-primary/40 hover:bg-primary/20"
            >
              <Icon name="Plus" size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-primary glow-text mb-2">
            Карта Персонажа D&D
          </h1>
          <p className="text-muted-foreground text-lg">Создайте легендарного героя</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-card/50 border border-primary/30">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="User" size={18} className="mr-2" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Backpack" size={18} className="mr-2" />
              Инвентарь
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Settings" size={18} className="mr-2" />
              Настройки
            </TabsTrigger>
            <TabsTrigger value="import-export" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Upload" size={18} className="mr-2" />
              Импорт/Экспорт
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 animate-fade-in">
            <Card className="parchment-texture border-2 border-primary/30">
              <CardHeader>
                <CardTitle className="text-3xl text-primary flex items-center gap-3">
                  <Icon name="Scroll" size={32} className="text-accent animate-glow" />
                  Основная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-foreground">Имя персонажа</Label>
                  <Input
                    id="name"
                    value={character.name}
                    onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-2 bg-background/50 border-primary/40 focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="race" className="text-foreground">Раса</Label>
                  <Input
                    id="race"
                    value={character.race}
                    onChange={(e) => setCharacter(prev => ({ ...prev, race: e.target.value }))}
                    className="mt-2 bg-background/50 border-primary/40 focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="class" className="text-foreground">Класс</Label>
                  <Input
                    id="class"
                    value={character.class}
                    onChange={(e) => setCharacter(prev => ({ ...prev, class: e.target.value }))}
                    className="mt-2 bg-background/50 border-primary/40 focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="level" className="text-foreground">Уровень</Label>
                  <Input
                    id="level"
                    type="number"
                    value={character.level}
                    onChange={(e) => setCharacter(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                    className="mt-2 bg-background/50 border-primary/40 focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="hp" className="text-foreground">HP</Label>
                  <Input
                    id="hp"
                    type="number"
                    value={character.hp}
                    onChange={(e) => setCharacter(prev => ({ ...prev, hp: parseInt(e.target.value) || 0 }))}
                    className="mt-2 bg-background/50 border-primary/40 focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="maxHp" className="text-foreground">Макс. HP</Label>
                  <Input
                    id="maxHp"
                    type="number"
                    value={character.maxHp}
                    onChange={(e) => setCharacter(prev => ({ ...prev, maxHp: parseInt(e.target.value) || 0 }))}
                    className="mt-2 bg-background/50 border-primary/40 focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="ac" className="text-foreground">Класс брони (AC)</Label>
                  <Input
                    id="ac"
                    type="number"
                    value={character.ac}
                    onChange={(e) => setCharacter(prev => ({ ...prev, ac: parseInt(e.target.value) || 0 }))}
                    className="mt-2 bg-background/50 border-primary/40 focus:border-primary"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="parchment-texture border-2 border-primary/30">
              <CardHeader>
                <CardTitle className="text-3xl text-primary flex items-center gap-3">
                  <Icon name="Sparkles" size={32} className="text-accent animate-glow" />
                  Характеристики
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Основные атрибуты персонажа (1-30)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AttributeCard
                    name="Сила"
                    value={character.attributes.strength}
                    onChange={(v) => handleAttributeChange('strength', v)}
                  />
                  <AttributeCard
                    name="Ловкость"
                    value={character.attributes.dexterity}
                    onChange={(v) => handleAttributeChange('dexterity', v)}
                  />
                  <AttributeCard
                    name="Телосложение"
                    value={character.attributes.constitution}
                    onChange={(v) => handleAttributeChange('constitution', v)}
                  />
                  <AttributeCard
                    name="Интеллект"
                    value={character.attributes.intelligence}
                    onChange={(v) => handleAttributeChange('intelligence', v)}
                  />
                  <AttributeCard
                    name="Мудрость"
                    value={character.attributes.wisdom}
                    onChange={(v) => handleAttributeChange('wisdom', v)}
                  />
                  <AttributeCard
                    name="Харизма"
                    value={character.attributes.charisma}
                    onChange={(v) => handleAttributeChange('charisma', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6 animate-fade-in">
            <Card className="parchment-texture border-2 border-primary/30">
              <CardHeader>
                <CardTitle className="text-3xl text-primary flex items-center gap-3">
                  <Icon name="Package" size={32} className="text-accent animate-glow" />
                  Добавить предмет
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="itemName" className="text-foreground">Название</Label>
                      <Input
                        id="itemName"
                        value={newItem.name}
                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Меч, Зелье здоровья..."
                        className="mt-2 bg-background/50 border-primary/40 focus:border-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="itemQuantity" className="text-foreground">Количество</Label>
                      <Input
                        id="itemQuantity"
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                        className="mt-2 bg-background/50 border-primary/40 focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="itemDescription" className="text-foreground">Описание</Label>
                    <Textarea
                      id="itemDescription"
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Опишите предмет..."
                      className="mt-2 bg-background/50 border-primary/40 focus:border-primary"
                    />
                  </div>
                  <Button onClick={addInventoryItem} className="w-full bg-primary hover:bg-primary/90">
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить в инвентарь
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="parchment-texture border-2 border-primary/30">
              <CardHeader>
                <CardTitle className="text-3xl text-primary flex items-center gap-3">
                  <Icon name="Backpack" size={32} className="text-accent animate-glow" />
                  Инвентарь
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Всего предметов: {character.inventory.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {character.inventory.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="PackageOpen" size={64} className="mx-auto mb-4 opacity-50" />
                    <p>Инвентарь пуст</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {character.inventory.map((item) => (
                      <Card key={item.id} className="bg-background/30 border-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-foreground text-lg">{item.name}</h4>
                                <Badge variant="secondary" className="bg-accent/20 text-accent">
                                  x{item.quantity}
                                </Badge>
                              </div>
                              {item.description && (
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeInventoryItem(item.id)}
                              className="hover:bg-destructive/20 hover:text-destructive ml-4"
                            >
                              <Icon name="Trash2" size={18} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="animate-fade-in">
            <Card className="parchment-texture border-2 border-primary/30">
              <CardHeader>
                <CardTitle className="text-3xl text-primary flex items-center gap-3">
                  <Icon name="Settings" size={32} className="text-accent animate-glow" />
                  Настройки персонажа
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">Информация о версии</h3>
                  <p className="text-muted-foreground">
                    Карта Персонажа D&D v1.0
                  </p>
                </div>
                <Separator className="bg-primary/20" />
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">Действия</h3>
                  <Button
                    variant="outline"
                    onClick={() => setCharacter(defaultCharacter)}
                    className="w-full border-destructive/50 text-destructive hover:bg-destructive/20"
                  >
                    <Icon name="RotateCcw" size={18} className="mr-2" />
                    Сбросить персонажа
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import-export" className="space-y-6 animate-fade-in">
            <Card className="parchment-texture border-2 border-primary/30">
              <CardHeader>
                <CardTitle className="text-3xl text-primary flex items-center gap-3">
                  <Icon name="Download" size={32} className="text-accent animate-glow" />
                  Экспорт
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Сохраните персонажа в файл JSON
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={exportCharacter} className="w-full bg-primary hover:bg-primary/90">
                  <Icon name="Download" size={18} className="mr-2" />
                  Экспортировать персонажа
                </Button>
              </CardContent>
            </Card>

            <Card className="parchment-texture border-2 border-primary/30">
              <CardHeader>
                <CardTitle className="text-3xl text-primary flex items-center gap-3">
                  <Icon name="Upload" size={32} className="text-accent animate-glow" />
                  Импорт
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Загрузите персонажа из файла JSON
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="importData" className="text-foreground">JSON данные</Label>
                  <Textarea
                    id="importData"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder='{"name": "Арагорн", "race": "Человек", ...}'
                    rows={10}
                    className="mt-2 bg-background/50 border-primary/40 focus:border-primary font-mono text-sm"
                  />
                </div>
                <Button onClick={importCharacter} className="w-full bg-accent hover:bg-accent/90">
                  <Icon name="Upload" size={18} className="mr-2" />
                  Импортировать персонажа
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;