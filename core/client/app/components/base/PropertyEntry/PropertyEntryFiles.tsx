import React from "react";
import { IPropertyEntryProps, getClassName } from ".";
import Dropzone, { DropzoneRef } from "react-dropzone";
import { Paper, RootRef, Icon, FormLabel, IconButton, Button } from "@material-ui/core";
import { PropertyDefinitionSupportedFilesType } from "../../../../../base/ItemDefinition/PropertyDefinition";
import { MAX_FILE_SIZE, FILE_SUPPORTED_IMAGE_TYPES } from "../../../../../constants";
import { mimeTypeToExtension, localeReplacer } from "../../../../../util";
import prettyBytes from "pretty-bytes";

interface IFileData {
  name: string;
  type: string;
  size: number;
}

function simpleQSparse(queryString: string): {[key: string]: string} {
  const query = {};
  queryString.split("&").forEach((pair: string) => {
    const pairData = pair.split("=");
    query[decodeURIComponent(pairData[0])] = decodeURIComponent(pairData[1] || "");
  });
  return query;
}

// because we expect to be efficient, we are going to actually store data in the url as
// query string, expected file location at /files/by-user/:userId/file/:fileId/:fileName?type=:contentType&size=:size
// a &small attribute should be valid too, for a small version of images
function extractFileDataFromUrl(url: string): IFileData {
  const [base, queryString] = url.split("?");
  const baseSplitted = base.split("/");
  const name = decodeURIComponent(baseSplitted[baseSplitted.length - 1]);
  const parsed = simpleQSparse(queryString);
  return {
    name,
    type: parsed.type,
    size: parseInt(parsed.size, 10),
  };
}

// in reality there might be invisible for the property
// rejected files, so all files will have this state
// regardless of anything, this is for the internal
interface IInternalURLFileDataWithState {
  url: string;
  rejected?: boolean;
  reason?: string;
}

export default class PropertyEntryFiles extends React.Component<IPropertyEntryProps, {}> {
  // we have a pool of owned urls that are alive during the existance
  // of this component, be careful of using those urls elsewhere, they
  // will be revoked when this component unmounts
  private ownedObjectURLPool: {[key: string]: File};

  // the dropzone ref
  private dropzoneRef = React.createRef<DropzoneRef>();

  constructor(props: IPropertyEntryProps) {
    super(props);

    // the pool is set
    this.ownedObjectURLPool = {};

    // the functions are binded
    this.onDropAccepted = this.onDropAccepted.bind(this);
    this.onDropRejected = this.onDropRejected.bind(this);
    this.onRemoveFile = this.onRemoveFile.bind(this);
    this.openFile = this.openFile.bind(this);
    this.manuallyTriggerUpload = this.manuallyTriggerUpload.bind(this);
  }
  public manuallyTriggerUpload() {
    // utility for the button to manually trigger upload
    // using the ref when it is disabled
    if (this.dropzoneRef.current) {
      this.dropzoneRef.current.open();
    }
  }
  public componentWillUnmount() {
    // revoke urls on unmount
    Object.keys(this.ownedObjectURLPool).forEach((ownedURL: string) => {
      URL.revokeObjectURL(ownedURL);
    });
  }
  public onDropAccepted(files: File[]) {
    // when a drop is accepted, let's check, if it's a single file
    const singleFile = this.props.property.getMaxLength() === 1;

    // let's get the object urls of the files added
    const objectURLS = files.map((file: File) => {
      const objectURL = URL.createObjectURL(file);
      this.ownedObjectURLPool[objectURL] = file;
      return objectURL;
    });

    // call the onchange, as replacing or as concatenating depending
    // on whether it is a single file or not
    this.props.onChange(
      (singleFile ? [] : this.props.value.value as PropertyDefinitionSupportedFilesType || []).concat(objectURLS),
      (singleFile ? [] : this.props.value.internalValue as IInternalURLFileDataWithState[] || []).concat(
        objectURLS.map((url: string) => ({url})),
      ),
    );
  }
  public onDropRejected(files: File[]) {
    // we need to create our internal values with the rejection and the reason of why
    // they were rejected
    const newInternalValueData: IInternalURLFileDataWithState[] = files.map((file: File) => {
      // create the object url
      const objectURL = URL.createObjectURL(file);
      // add it to the pool
      this.ownedObjectURLPool[objectURL] = file;

      // check if it's images we are accepting
      const isImage = (this.props.property.getSpecialProperty("accept") as string || "").startsWith("image");
      // the reason by default is that is an invalid type
      let reason = isImage ? "image_uploader_invalid_type" : "file_uploader_invalid_type";
      // but if the file is too large
      if (file.size > MAX_FILE_SIZE) {
        // change it to that
        reason = isImage ? "image_uploader_file_too_big" : "file_uploader_file_too_big";
      }

      return {
        url: objectURL,
        rejected: true,
        reason,
      };
    });

    // if it's a single file
    const singleFile = this.props.property.getMaxLength() === 1;

    // the internal value currently, it might be null so we need to recreate it
    // as what is the value currently, before the drop is going to be added
    // note that it is hardset to an empty string if it's a single file
    // so it forces a replacement, none of the conditionals will pass, it will
    // just remain an empty array, making it replace
    let valueAsInternal: IInternalURLFileDataWithState[] = singleFile ? [] : this.props.value.internalValue;
    if (!valueAsInternal && this.props.value.value) {
      valueAsInternal = (
        this.props.value.value as PropertyDefinitionSupportedFilesType
      ).map((url: string) => ({url}));
    } else if (!valueAsInternal) {
      valueAsInternal = [];
    }

    // by the same logic the onchange set it to null
    // replacing an existant file if there was one
    this.props.onChange(
      singleFile ? null : this.props.value.value,
      valueAsInternal.concat(newInternalValueData),
    );
  }
  public openFile(url: string, e: React.MouseEvent<HTMLButtonElement>) {
    // open a file, let's stop the propagation
    // for some reason it's not possible to set the window title
    e.stopPropagation();
    e.preventDefault();

    const w = window.open(url, "_blank");
  }
  public onRemoveFile(url: string, e: React.MouseEvent<HTMLButtonElement>) {
    // stop the propagation and stuff
    e.stopPropagation();
    e.preventDefault();

    // revoke the url and remove it from the pool
    if (this.ownedObjectURLPool[url]) {
      delete this.ownedObjectURLPool[url];
      URL.revokeObjectURL(url);
    }

    // let's get the index in the internal value
    const indexInInternalValue = (this.props.value.internalValue as IInternalURLFileDataWithState[] || []).findIndex(
      (value) => value.url === url,
    );
    // this will be the new value
    let newInternalValue = this.props.value.internalValue as IInternalURLFileDataWithState[];
    // if the index in the internal value the url is there
    if (indexInInternalValue !== -1) {
      // we make a copy, and splice it, and set it to null if necessary
      newInternalValue = [...newInternalValue];
      newInternalValue.splice(indexInInternalValue, 1);
      if (newInternalValue.length === 0) {
        newInternalValue = null;
      }
    }

    // let's do the exact same but for the actual value
    const indexInValue = (this.props.value.value as PropertyDefinitionSupportedFilesType || []).findIndex(
      (value) => value === url,
    );
    let newValue = this.props.value.value as PropertyDefinitionSupportedFilesType;
    if (indexInValue !== -1) {
      newValue = [...newValue];
      newValue.splice(indexInValue, 1);
      if (newValue.length === 0) {
        newValue = null;
      }
    }

    // trigger the on change
    this.props.onChange(newValue, newInternalValue);
  }
  public render() {
    // getting the basic data
    const i18nData = this.props.property.getI18nDataFor(this.props.language);
    const className = getClassName(this.props, "files", this.props.poked);
    const i18nLabel = i18nData && i18nData.label;
    const i18nPlaceholder = i18nData && i18nData.placeholder;

    // getting the icon
    const icon = this.props.property.getIcon();
    const iconComponent = icon ? (
      <Icon classes={{root: "property-entry-icon"}}>{icon}</Icon>
    ) : null;

    // whether it is a single file
    const singleFile = this.props.property.getMaxLength() === 1;
    // whether we are expecting images only
    const isExpectingImages = (this.props.property.getSpecialProperty("accept") as string || "").startsWith("image");

    // the placeholder when active
    let placeholderActive = singleFile ?
      this.props.i18n.file_uploader_placeholder_active_single :
      this.props.i18n.file_uploader_placeholder_active;
    if (isExpectingImages) {
      placeholderActive = singleFile ?
        this.props.i18n.image_uploader_placeholder_active_single :
        this.props.i18n.image_uploader_placeholder_active;
    }

    // the invalid reason
    const invalidReason = this.props.value.invalidReason;
    let i18nInvalidReason = null;
    if (
      (this.props.poked || this.props.value.userSet) &&
      invalidReason && i18nData &&
      i18nData.error && i18nData.error[invalidReason]
    ) {
      i18nInvalidReason = i18nData.error[invalidReason];
    }

    // what are we accepting, note that "image" will trasnlate to the
    // supported browser image types
    let accept: string | string[] = this.props.property.getSpecialProperty("accept") as string;
    if (accept === "image") {
      accept = FILE_SUPPORTED_IMAGE_TYPES;
    }

    // the value from the internal source, either recreated or from the internal value
    let valueAsInternal: IInternalURLFileDataWithState[] = this.props.value.internalValue;
    if (!valueAsInternal && this.props.value.value) {
      valueAsInternal = (
        this.props.value.value as PropertyDefinitionSupportedFilesType
      ).map((url: string) => ({url}));
    } else if (!valueAsInternal) {
      valueAsInternal = [];
    }

    // return the component itself
    return (
      <div className={className}>
        <FormLabel
          aria-label={i18nLabel}
          classes={{
            root: "property-entry-label",
            focused: "focused",
          }}
        >
          {i18nLabel}{iconComponent}
        </FormLabel>
        <Dropzone
          onDropAccepted={this.onDropAccepted}
          onDropRejected={this.onDropRejected}
          maxSize={MAX_FILE_SIZE}
          accept={accept}
          multiple={!singleFile}
          noClick={singleFile && valueAsInternal.length === 1}
          ref={this.dropzoneRef}
        >
          {({
            getRootProps,
            getInputProps,
            isDragActive,
            isDragAccept,
            isDragReject,
          }) => {
            const {ref, ...rootProps} = getRootProps();

            const files = valueAsInternal.map((value, index) => {
              const fileData: IFileData = this.ownedObjectURLPool[value.url] || extractFileDataFromUrl(value.url);
              const isSupportedImage = fileData.type.startsWith("image/") &&
                FILE_SUPPORTED_IMAGE_TYPES.includes(fileData.type);
              const fileClassName =
                `property-entry-files-file ${value.rejected ?
                  "property-entry-files-file--rejected" : ""} ${isSupportedImage ?
                  "property-entry-files-file--is-image" : ""}`;
              if (isSupportedImage) {
                const reduceSizeURL =
                  value.url.indexOf("blob:") !== 0 && !singleFile ?
                  value.url + "&small" :
                  value.url;
                return (
                  <div
                    className={fileClassName}
                    key={index}
                    onClick={this.openFile.bind(this, value.url)}
                  >
                    <div className="property-entry-files-file-image">
                      <img src={reduceSizeURL}/>
                      {!singleFile ? <IconButton
                        className="property-entry-files-file-delete"
                        onClick={this.onRemoveFile.bind(this, value.url)}
                      >
                        <Icon>remove_circle</Icon>
                      </IconButton> : null}
                    </div>
                    <p className="property-entry-files-file-name">{fileData.name}</p>
                    <p className="property-entry-files-file-size">({
                      prettyBytes(fileData.size)
                    })</p>
                    {value.rejected ? <p className="property-entry-files-file-rejected-reason">
                      {localeReplacer(this.props.i18n[value.reason], prettyBytes(MAX_FILE_SIZE))}
                    </p> : null}
                  </div>
                );
              } else {
                return (
                  <div
                    className={fileClassName}
                    key={index}
                    onClick={this.openFile.bind(this, value.url)}
                  >
                    <div className="property-entry-files-file-icon">
                      <Icon className="property-entry-files-file-icon-background">insert_drive_file</Icon>
                      <span className="property-entry-files-file-icon-filetype">{
                        mimeTypeToExtension(fileData.type)
                      }</span>
                      {!singleFile ? <IconButton
                        className="property-entry-files-file-delete"
                        onClick={this.onRemoveFile.bind(this, value.url)}
                      >
                        <Icon>remove_circle</Icon>
                      </IconButton> : null}
                    </div>
                    <p className="property-entry-files-file-name">{fileData.name}</p>
                    <p className="property-entry-files-file-size">({
                      prettyBytes(fileData.size)
                    })</p>
                    {value.rejected ? <p className="property-entry-files-file-rejected-reason">
                      {localeReplacer(this.props.i18n[value.reason], prettyBytes(MAX_FILE_SIZE))}
                    </p> : null}
                  </div>
                );
              }
            });

            return (
              <RootRef rootRef={ref}>
                <Paper
                  {...rootProps}
                  classes={{
                    root: `property-entry-files-paper ${singleFile ?
                      "property-entry-files-paper--single-file" : ""}`,
                  }}
                >
                  <input {...getInputProps()} />
                  {files}
                  {
                    (
                      this.props.property.getMaxLength() >
                      valueAsInternal.length
                    ) ?
                    <div
                      className={
                        `property-entry-files-placeholder ${isDragAccept ?
                        "property-entry-files-placeholder--accepting" : ""} ${isDragReject ?
                        "property-entry-files-placeholder--rejecting" : ""}`
                      }
                    >
                      {!valueAsInternal.length ? <p>{isDragActive ? placeholderActive : i18nPlaceholder}</p> : null}
                      <Icon className="property-entry-files-icon-add">note_add</Icon>
                    </div> :
                    null
                  }
                  {
                    singleFile && valueAsInternal.length === 1 ? <div
                      className="property-entry-files-button-container"
                    >
                      <Button
                        className="property-entry-files-button"
                        variant="contained"
                        color="secondary"
                        onClick={this.onRemoveFile.bind(this, valueAsInternal[0].url)}
                      >
                        {
                          isExpectingImages ?
                          this.props.i18n.image_uploader_delete_file :
                          this.props.i18n.file_uploader_delete_file
                        }
                        <Icon className="property-entry-files-button-icon">remove_circle_outline</Icon>
                      </Button>
                      <Button
                        className="property-entry-files-button"
                        variant="contained"
                        color="primary"
                        onClick={this.manuallyTriggerUpload}
                      >
                        {
                          isExpectingImages ?
                          this.props.i18n.image_uploader_select_file :
                          this.props.i18n.file_uploader_select_file
                        }
                        <Icon className="property-entry-files-button-icon">cloud_upload</Icon>
                      </Button>
                    </div> : null
                  }
                </Paper>
              </RootRef>
            );
          }}
        </Dropzone>
        <div className="property-entry-error">
          {i18nInvalidReason}
        </div>
      </div>
    );
  }
}
