import React from "react";
import { FlatList, FlatListProps } from "react-native";
import type { SavedItem } from "../../context/SavedContext";

type SavedListProps = Pick<
  FlatListProps<SavedItem>,
  "data" | "renderItem" | "keyExtractor" | "contentContainerStyle" | "extraData"
>;

const SavedList: React.FC<SavedListProps> = ({
  data,
  renderItem,
  keyExtractor,
  contentContainerStyle,
  extraData,
}) => (
  <FlatList
    data={data}
    renderItem={renderItem}
    keyExtractor={keyExtractor}
    contentContainerStyle={contentContainerStyle}
    extraData={extraData}
  />
);

export default SavedList;
