import React from 'react';
import { useLogging, LogCategory, LogLevel } from '../contexts/LoggingContext';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const LoggingControls: React.FC = () => {
  const {
    config,
    toggleLogging,
    toggleCategory,
    toggleLevel,
    toggleUseGroups,
    toggleDefaultCollapsed
  } = useLogging();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Logging Controls
          <Switch
            checked={config.enabled}
            onCheckedChange={toggleLogging}
            id="logging-toggle"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="categories">
          <TabsList className="mb-4">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="levels">Levels</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(config.categories) as LogCategory[]).map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Switch
                    checked={config.categories[category]}
                    onCheckedChange={() => toggleCategory(category)}
                    id={`category-${category}`}
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    style={{ color: category === 'App' ? '#4CAF50' :
                             category === 'Graph' ? '#2196F3' :
                             category === 'Svg' ? '#9C27B0' :
                             category === 'Form' ? '#FF9800' : '#607D8B' }}
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="levels">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(config.levels) as LogLevel[]).map(level => (
                <div key={level} className="flex items-center space-x-2">
                  <Switch
                    checked={config.levels[level]}
                    onCheckedChange={() => toggleLevel(level)}
                    id={`level-${level}`}
                  />
                  <Label
                    htmlFor={`level-${level}`}
                    style={{ color: level === 'debug' ? '#90A4AE' :
                             level === 'info' ? '#64B5F6' :
                             level === 'warn' ? '#FFD54F' : '#EF5350' }}
                  >
                    {level}
                  </Label>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="groups">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.useGroups}
                  onCheckedChange={toggleUseGroups}
                  id="use-groups"
                />
                <Label htmlFor="use-groups">Use Console Groups</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.defaultCollapsed}
                  onCheckedChange={toggleDefaultCollapsed}
                  id="default-collapsed"
                />
                <Label htmlFor="default-collapsed">Default to Collapsed Groups</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
